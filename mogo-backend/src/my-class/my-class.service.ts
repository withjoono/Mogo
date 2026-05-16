import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toMogoMemberId } from '../common/utils/member-id.util';
import { HubInternalService, HubGroupMember } from '../hub-client';

@Injectable()
export class MyClassService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hubInternal: HubInternalService,
  ) {}

  /**
   * Hub 그룹 멤버(hubUserId[]) → 로컬 Member 매핑.
   * 점수 SELECT를 위해 numeric id가 필요하고, name/role 표시를 위해 매핑 보존.
   */
  private async resolveHubMembers(hubMembers: HubGroupMember[]): Promise<{
    numericIds: number[];
    info: Map<number, { hubUserId: string; name: string; role: string }>;
  }> {
    const mogoIds = hubMembers.map((m) => toMogoMemberId(m.hubUserId));
    const rows = await this.prisma.member.findMany({
      where: { memberId: { in: mogoIds } },
      select: { id: true, memberId: true, name: true },
    });
    const byMogoId = new Map(rows.map((r) => [r.memberId, r]));

    const info = new Map<number, { hubUserId: string; name: string; role: string }>();
    const numericIds: number[] = [];
    for (const m of hubMembers) {
      const row = byMogoId.get(toMogoMemberId(m.hubUserId));
      if (!row) continue; // Mogo에 아직 sync 안된 사용자는 점수 없음 → 스킵
      numericIds.push(row.id);
      info.set(row.id, {
        hubUserId: m.hubUserId,
        name: m.displayName || row.name,
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
    const hubMembers = await this.hubInternal.getGroupMembers(classId);
    // 빈 응답 = Hub 서비스 토큰 미주입 또는 그룹 비어있음 → 빈 ranking으로 부드럽게 종료
    if (hubMembers.length === 0) return { classId, examId: null, examName: null, ranking: [] };
    if (!hubMembers.some((m) => m.hubUserId === requesterHubUserId)) {
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
      const name = meta?.name ?? '';
      const maskedName = name.length > 1 ? name[0] + '*'.repeat(name.length - 1) : name;
      const isMe = mid === myNumericId;
      return {
        rank: score ? idx + 1 : null,
        isMe,
        memberId: mid,
        hubUserId: meta?.hubUserId,
        name: isMe ? '나' : maskedName,
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
    const hubMembers = await this.hubInternal.getGroupMembers(classId);
    if (hubMembers.length === 0) return { exams: [], trendsByMember: [] };
    if (!hubMembers.some((m) => m.hubUserId === requesterHubUserId)) {
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
      const name = meta?.name ?? '';
      const maskedName = name.length > 1 ? name[0] + '*'.repeat(name.length - 1) : name;
      const isMe = mid === myNumericId;
      const myScores = allScores.filter((s) => s.memberId === mid);
      return {
        memberId: mid,
        hubUserId: meta?.hubUserId,
        isMe,
        name: isMe ? '나' : maskedName,
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
