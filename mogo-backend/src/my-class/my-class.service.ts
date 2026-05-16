import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toMogoMemberId } from '../common/utils/member-id.util';
import { HubInternalService } from '../hub-client';

@Injectable()
export class MyClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hubInternal: HubInternalService,
  ) {}

  /**
   * Hub 그룹 멤버 응답 정규화 — camelCase/snake_case 양쪽 수용.
   * Hub이 nickname/displayName/display_name 중 어느 키로 주든 추출.
   */
  private normalizeHubMember(m: any): {
    hubUserId: string;
    role: string;
    displayName?: string;
  } | null {
    const hubUserId = m.hubUserId ?? m.hub_user_id ?? m.userId ?? m.user_id;
    if (!hubUserId) return null;
    return {
      hubUserId,
      role: m.role ?? 'member',
      displayName: m.displayName ?? m.display_name ?? m.nickname ?? m.nick_name,
    };
  }

  /**
   * Hub 그룹 멤버(hubUserId[]) → 로컬 Member 매핑.
   * 점수 SELECT를 위해 numeric id가 필요하고, nickname/role 표시를 위해 매핑 보존.
   */
  private async resolveHubMembers(rawMembers: any[]): Promise<{
    numericIds: number[];
    info: Map<number, { hubUserId: string; nickname: string | null; role: string }>;
  }> {
    const normalized = rawMembers
      .map((m) => this.normalizeHubMember(m))
      .filter((m): m is NonNullable<ReturnType<typeof this.normalizeHubMember>> => m !== null);

    const mogoIds = normalized.map((m) => toMogoMemberId(m.hubUserId));
    const rows = await this.prisma.member.findMany({
      where: { memberId: { in: mogoIds } },
      select: { id: true, memberId: true, name: true },
    });
    const byMogoId = new Map(rows.map((r) => [r.memberId, r]));

    const info = new Map<number, { hubUserId: string; nickname: string | null; role: string }>();
    const numericIds: number[] = [];
    for (const m of normalized) {
      const row = byMogoId.get(toMogoMemberId(m.hubUserId));
      if (!row) continue;
      numericIds.push(row.id);
      info.set(row.id, {
        hubUserId: m.hubUserId,
        // 우선순위: Hub displayName(=닉네임) > 로컬 member.name > null
        nickname: m.displayName || row.name || null,
        role: m.role,
      });
    }
    return { numericIds, info };
  }

  /**
   * Hub 문자열 memberId → DB 숫자 id 변환
   * 프론트엔드는 "S26H003141" 형식의 문자열 ID를 전달하므로 변환 필요
   */
  async resolveNumericMemberId(hubMemberId: string): Promise<number> {
    const mogoId = toMogoMemberId(hubMemberId);
    const member = await this.prisma.member.findUnique({ where: { memberId: mogoId } });
    if (!member) throw new NotFoundException(`멤버를 찾을 수 없습니다: ${hubMemberId}`);
    return member.id;
  }

  // ──────────────────────────────────────────────────────────────
  // 목표대학 반 (anonymous ranking for same-target department)
  // ──────────────────────────────────────────────────────────────

  private computeGradeSum(grades: (number | null | undefined)[]): number | null {
    const valid = grades.filter((g): g is number => g != null);
    return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) : null;
  }

  async getTargetClassRanking(departmentCode: string, myMemberId: number, examId?: number) {
    // 해당 학과를 목표로 한 모든 학생 memberId 수집
    const targets = await this.prisma.studentTarget.findMany({
      where: { departmentCode },
      select: { memberId: true },
    });
    const memberIds = targets.map((t) => t.memberId);
    if (memberIds.length === 0) return { total: 0, myRank: null, myScore: null, ranking: [] };

    // 기준 시험 결정 (없으면 최신)
    let targetExamId = examId;
    if (!targetExamId) {
      const latest = await this.prisma.studentScore.findFirst({
        where: { memberId: { in: memberIds } },
        orderBy: { mockExam: { year: 'desc' } },
        select: { mockExamId: true },
      });
      if (!latest) return { total: memberIds.length, myRank: null, myScore: null, ranking: [] };
      targetExamId = latest.mockExamId;
    }

    const scores = await this.prisma.studentScore.findMany({
      where: { memberId: { in: memberIds }, mockExamId: targetExamId },
      include: { mockExam: { select: { id: true, name: true, year: true, month: true } } },
      orderBy: { totalStandardSum: 'desc' },
    });

    const ranking = scores.map((s, idx) => ({
      rank: idx + 1,
      isMe: s.memberId === myMemberId,
      totalStandardSum: s.totalStandardSum,
      totalPercentileSum: s.totalPercentileSum ? Number(s.totalPercentileSum) : null,
      gradeSum: this.computeGradeSum([s.koreanGrade, s.mathGrade, s.englishGrade, s.inquiry1Grade, s.inquiry2Grade, s.historyGrade]),
      topCumulativeStd: s.topCumulativeStd ? Number(s.topCumulativeStd) : null,
      koreanStandard: s.koreanStandard,
      koreanPercentile: s.koreanPercentile ? Number(s.koreanPercentile) : null,
      mathStandard: s.mathStandard,
      mathPercentile: s.mathPercentile ? Number(s.mathPercentile) : null,
      inquiry1Standard: s.inquiry1Standard,
      inquiry2Standard: s.inquiry2Standard,
      englishGrade: s.englishGrade,
      historyGrade: s.historyGrade,
      mockExam: s.mockExam,
    }));

    const myEntry = ranking.find((r) => r.isMe);

    return {
      total: memberIds.length,
      scoredTotal: scores.length,
      examId: targetExamId,
      examName: scores[0]?.mockExam?.name ?? null,
      myRank: myEntry?.rank ?? null,
      myScore: myEntry?.totalStandardSum ?? null,
      ranking,
    };
  }

  async getTargetClassTrend(departmentCode: string, myMemberId: number) {
    const targets = await this.prisma.studentTarget.findMany({
      where: { departmentCode },
      select: { memberId: true },
    });
    const memberIds = targets.map((t) => t.memberId);
    if (memberIds.length === 0) return { exams: [], myTrend: [], bands: [] };

    // 모든 시험별 점수 집계
    const allScores = await this.prisma.studentScore.findMany({
      where: { memberId: { in: memberIds } },
      include: { mockExam: { select: { id: true, name: true, year: true, month: true } } },
      orderBy: [{ mockExam: { year: 'asc' } }, { mockExam: { month: 'asc' } }],
    });

    // 시험별로 그룹화
    const examMap = new Map<number, { exam: any; scores: number[] }>();
    for (const s of allScores) {
      if (s.totalStandardSum == null) continue;
      const key = s.mockExamId;
      if (!examMap.has(key)) examMap.set(key, { exam: s.mockExam, scores: [] });
      examMap.get(key)!.scores.push(s.totalStandardSum);
    }

    const exams: any[] = [];
    const bands: any[] = [];

    for (const [, { exam, scores }] of examMap) {
      if (scores.length === 0) continue;
      scores.sort((a, b) => a - b);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const top10 = scores[Math.floor(scores.length * 0.9)] ?? scores[scores.length - 1];
      const bot10 = scores[Math.floor(scores.length * 0.1)] ?? scores[0];

      exams.push({ id: exam.id, name: exam.name, year: exam.year, month: exam.month });
      bands.push({ examId: exam.id, avg: Math.round(avg), top10, bot10, count: scores.length });
    }

    // 내 추이
    const myScores = await this.prisma.studentScore.findMany({
      where: { memberId: myMemberId, mockExamId: { in: exams.map((e) => e.id) } },
      orderBy: [{ mockExam: { year: 'asc' } }, { mockExam: { month: 'asc' } }],
      include: { mockExam: { select: { id: true } } },
    });
    const myTrend = myScores.map((s) => ({
      examId: s.mockExamId,
      totalStandardSum: s.totalStandardSum,
      koreanStandard: s.koreanStandard,
      mathStandard: s.mathStandard,
      inquiry1Standard: s.inquiry1Standard,
      inquiry2Standard: s.inquiry2Standard,
    }));

    return { exams, myTrend, bands };
  }

  // ──────────────────────────────────────────────────────────────
  // 그룹 스터디 CRUD는 Hub /api/groups/*로 위임됨 (controller가 HubClientService 호출).
  // 로컬 mg_my_classes / mg_class_members 테이블은 cutover 검증 1주 후 폐기 예정.
  // ──────────────────────────────────────────────────────────────

  // ──────────────────────────────────────────────────────────────
  // 그룹 스터디 랭킹/추이 (Hub 멤버 + 로컬 점수 합성)
  //
  // 흐름: classId(= Hub group id) → HubInternalService.getGroupMembers
  //       → hubUserIds → toMogoMemberId() → Member 매핑 → studentScore SELECT
  // 멤버십 검증: 요청자(requesterHubUserId)가 Hub 멤버 목록에 포함돼야 함.
  // ──────────────────────────────────────────────────────────────

  async getGroupStudyRanking(requesterHubUserId: string, classId: number) {
    const rawMembers = await this.hubInternal.getGroupMembers(classId);
    // Hub 멤버 가져올 수 없으면(서비스 토큰 미주입 등) 본인만 단독 멤버 취급해
    // 최소한 자기 성적은 표시되도록 함. 토큰 주입되면 자동으로 정상 동작.
    const hubMembers = rawMembers.length === 0
      ? [{ hubUserId: requesterHubUserId, role: 'member', joinedAt: '' }]
      : rawMembers;

    const normalized = hubMembers
      .map((m) => this.normalizeHubMember(m))
      .filter((m): m is NonNullable<ReturnType<typeof this.normalizeHubMember>> => m !== null);
    if (!normalized.some((m) => m.hubUserId === requesterHubUserId)) {
      throw new ForbiddenException('클래스 멤버만 조회할 수 있습니다.');
    }

    const { numericIds: memberIds, info } = await this.resolveHubMembers(hubMembers);
    if (memberIds.length === 0) return { classId, examId: null, examName: null, ranking: [] };

    const myMember = await this.prisma.member.findUnique({
      where: { memberId: toMogoMemberId(requesterHubUserId) },
      select: { id: true },
    });
    const myNumericId = myMember?.id ?? -1;

    // 최신 시험 기준
    const latest = await this.prisma.studentScore.findFirst({
      where: { memberId: { in: memberIds } },
      orderBy: [{ mockExam: { year: 'desc' } }, { mockExam: { month: 'desc' } }],
      select: { mockExamId: true, mockExam: { select: { name: true, year: true, month: true } } },
    });
    if (!latest) return { examId: null, examName: null, ranking: [] };

    const scores = await this.prisma.studentScore.findMany({
      where: { memberId: { in: memberIds }, mockExamId: latest.mockExamId },
      orderBy: { totalStandardSum: 'desc' },
    });

    const scoreMap = new Map(scores.map((s) => [s.memberId, s]));

    // 이전 시험 점수 (변화량 계산용)
    const prevExam = await this.prisma.studentScore.findFirst({
      where: { memberId: { in: memberIds }, mockExamId: { lt: latest.mockExamId } },
      orderBy: [{ mockExam: { year: 'desc' } }, { mockExam: { month: 'desc' } }],
      select: { mockExamId: true },
    });
    const prevScoreMap = new Map<number, number>();
    if (prevExam) {
      const prevScores = await this.prisma.studentScore.findMany({
        where: { memberId: { in: memberIds }, mockExamId: prevExam.mockExamId },
        select: { memberId: true, totalStandardSum: true },
      });
      prevScores.forEach((s) => { if (s.totalStandardSum) prevScoreMap.set(s.memberId, s.totalStandardSum); });
    }

    // 점수 있는 멤버 → 순위 부여, 점수 없는 멤버 → 뒤에 추가
    const rankedMembers = [...memberIds]
      .sort((a, b) => (scoreMap.get(b)?.totalStandardSum ?? -1) - (scoreMap.get(a)?.totalStandardSum ?? -1));

    const ranking = rankedMembers.map((mid, idx) => {
      const score = scoreMap.get(mid);
      const prev = prevScoreMap.get(mid);
      const meta = info.get(mid);
      const isMe = mid === myNumericId;
      // 그룹스터디는 명시적 가입자라 마스킹 없음. nickname 그대로 노출.
      const nickname = meta?.nickname ?? '익명';
      return {
        rank: score ? idx + 1 : null,
        isMe,
        memberId: mid,
        hubUserId: meta?.hubUserId,
        nickname,
        name: nickname, // 하위호환 (FE가 기존 r.name 참조)
        role: meta?.role ?? 'member',
        totalStandardSum: score?.totalStandardSum ?? null,
        totalPercentileSum: score?.totalPercentileSum ? Number(score.totalPercentileSum) : null,
        gradeSum: this.computeGradeSum([score?.koreanGrade, score?.mathGrade, score?.englishGrade, score?.inquiry1Grade, score?.inquiry2Grade, score?.historyGrade]),
        change: score?.totalStandardSum != null && prev != null ? score.totalStandardSum - prev : null,
        koreanStandard: score?.koreanStandard ?? null,
        mathStandard: score?.mathStandard ?? null,
        englishGrade: score?.englishGrade ?? null,
        latestExamName: score ? latest.mockExam.name : null,
      };
    });

    return {
      classId,
      examId: latest.mockExamId,
      examName: latest.mockExam.name,
      ranking,
    };
  }

  async getGroupStudyTrend(requesterHubUserId: string, classId: number) {
    const rawMembers = await this.hubInternal.getGroupMembers(classId);
    const hubMembers = rawMembers.length === 0
      ? [{ hubUserId: requesterHubUserId, role: 'member', joinedAt: '' }]
      : rawMembers;

    const normalized = hubMembers
      .map((m) => this.normalizeHubMember(m))
      .filter((m): m is NonNullable<ReturnType<typeof this.normalizeHubMember>> => m !== null);
    if (!normalized.some((m) => m.hubUserId === requesterHubUserId)) {
      throw new ForbiddenException('클래스 멤버만 조회할 수 있습니다.');
    }

    const { numericIds: memberIds, info } = await this.resolveHubMembers(hubMembers);
    if (memberIds.length === 0) return { exams: [], trendsByMember: [] };

    const myMember = await this.prisma.member.findUnique({
      where: { memberId: toMogoMemberId(requesterHubUserId) },
      select: { id: true },
    });
    const myNumericId = myMember?.id ?? -1;

    const allScores = await this.prisma.studentScore.findMany({
      where: { memberId: { in: memberIds } },
      include: { mockExam: { select: { id: true, name: true, year: true, month: true } } },
      orderBy: [{ mockExam: { year: 'asc' } }, { mockExam: { month: 'asc' } }],
    });

    // 시험 목록
    const examMap = new Map<number, any>();
    allScores.forEach((s) => { if (!examMap.has(s.mockExamId)) examMap.set(s.mockExamId, s.mockExam); });
    const exams = [...examMap.values()];

    // 멤버별 추이
    const trendsByMember = memberIds.map((mid) => {
      const meta = info.get(mid);
      const isMe = mid === myNumericId;
      const nickname = meta?.nickname ?? '익명';
      const myScores = allScores.filter((s) => s.memberId === mid);
      return {
        memberId: mid,
        hubUserId: meta?.hubUserId,
        isMe,
        nickname,
        name: nickname,
        role: meta?.role ?? 'member',
        data: myScores.map((s) => ({
          examId: s.mockExamId,
          totalStandardSum: s.totalStandardSum,
          koreanStandard: s.koreanStandard,
          mathStandard: s.mathStandard,
          inquiry1Standard: s.inquiry1Standard,
          inquiry2Standard: s.inquiry2Standard,
        })),
      };
    });

    return { exams, trendsByMember };
  }
}
