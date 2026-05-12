import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupStudyDto, JoinGroupStudyDto } from './dto/my-class.dto';

@Injectable()
export class MyClassService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────────────────────
  // 목표대학 반 (anonymous ranking for same-target department)
  // ──────────────────────────────────────────────────────────────

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
  // 그룹 스터디 CRUD
  // ──────────────────────────────────────────────────────────────

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async createGroupStudy(memberId: number, dto: CreateGroupStudyDto) {
    let classCode: string;
    // 중복 없는 코드 생성
    do { classCode = this.generateCode(); }
    while (await this.prisma.myClass.findUnique({ where: { classCode } }));

    const myClass = await this.prisma.myClass.create({
      data: {
        classCode,
        name: dto.name,
        description: dto.description,
        maxMembers: dto.maxMembers ?? 20,
        creatorId: memberId,
        members: { create: { memberId, role: 'leader' } },
      },
    });
    return myClass;
  }

  async getMyGroupStudies(memberId: number) {
    const memberships = await this.prisma.classMember.findMany({
      where: { memberId },
      include: {
        myClass: {
          include: { _count: { select: { members: true } } },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return memberships.map((m) => ({
      ...m.myClass,
      memberCount: m.myClass._count.members,
      myRole: m.role,
      _count: undefined,
    }));
  }

  async joinGroupStudy(memberId: number, dto: JoinGroupStudyDto) {
    const myClass = await this.prisma.myClass.findUnique({ where: { classCode: dto.classCode } });
    if (!myClass) throw new NotFoundException('클래스 코드를 찾을 수 없습니다.');

    const existing = await this.prisma.classMember.findUnique({
      where: { classId_memberId: { classId: myClass.id, memberId } },
    });
    if (existing) throw new BadRequestException('이미 참여 중인 클래스입니다.');

    const count = await this.prisma.classMember.count({ where: { classId: myClass.id } });
    if (count >= myClass.maxMembers) throw new BadRequestException('클래스 정원이 가득 찼습니다.');

    await this.prisma.classMember.create({ data: { classId: myClass.id, memberId, role: 'member' } });
    return myClass;
  }

  async leaveGroupStudy(memberId: number, classId: number) {
    const myClass = await this.prisma.myClass.findUnique({ where: { id: classId } });
    if (!myClass) throw new NotFoundException('클래스를 찾을 수 없습니다.');

    const membership = await this.prisma.classMember.findUnique({
      where: { classId_memberId: { classId, memberId } },
    });
    if (!membership) throw new NotFoundException('해당 클래스의 멤버가 아닙니다.');

    // 개설자가 나가면 클래스 삭제
    if (myClass.creatorId === memberId) {
      await this.prisma.myClass.delete({ where: { id: classId } });
      return { deleted: true };
    }
    await this.prisma.classMember.delete({ where: { classId_memberId: { classId, memberId } } });
    return { deleted: false };
  }

  async getGroupStudyRanking(memberId: number, classId: number) {
    const membership = await this.prisma.classMember.findUnique({
      where: { classId_memberId: { classId, memberId } },
    });
    if (!membership) throw new ForbiddenException('클래스 멤버만 조회할 수 있습니다.');

    const members = await this.prisma.classMember.findMany({
      where: { classId },
      include: { member: { select: { id: true, name: true } } },
    });
    const memberIds = members.map((m) => m.memberId);

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

    const memberInfo = new Map(members.map((m) => [m.memberId, m]));

    const ranking = rankedMembers.map((mid, idx) => {
      const score = scoreMap.get(mid);
      const prev = prevScoreMap.get(mid);
      const info = memberInfo.get(mid)!;
      const name = info.member.name;
      const maskedName = name.length > 1 ? name[0] + '*'.repeat(name.length - 1) : name;
      return {
        rank: score ? idx + 1 : null,
        isMe: mid === memberId,
        memberId: mid,
        name: mid === memberId ? '나' : maskedName,
        role: info.role,
        totalStandardSum: score?.totalStandardSum ?? null,
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

  async getGroupStudyTrend(memberId: number, classId: number) {
    const membership = await this.prisma.classMember.findUnique({
      where: { classId_memberId: { classId, memberId } },
    });
    if (!membership) throw new ForbiddenException('클래스 멤버만 조회할 수 있습니다.');

    const members = await this.prisma.classMember.findMany({
      where: { classId },
      include: { member: { select: { id: true, name: true } } },
    });
    const memberIds = members.map((m) => m.memberId);

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
    const memberInfo = new Map(members.map((m) => [m.memberId, m]));
    const trendsByMember = memberIds.map((mid) => {
      const info = memberInfo.get(mid)!;
      const name = info.member.name;
      const maskedName = name.length > 1 ? name[0] + '*'.repeat(name.length - 1) : name;
      const myScores = allScores.filter((s) => s.memberId === mid);
      return {
        memberId: mid,
        isMe: mid === memberId,
        name: mid === memberId ? '나' : maskedName,
        role: info.role,
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
