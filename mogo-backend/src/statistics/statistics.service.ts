import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toMogoMemberId } from '../common/utils/member-id.util';
import {
  TrendRequestDto,
  CumulativeRequestDto,
  SubjectAnalysisRequestDto,
} from './dto/statistics-request.dto';
import {
  TrendAnalysisDto,
  SubjectTrendDto,
  ExamDataPointDto,
  CumulativeAnalysisDto,
  CumulativeStatsDto,
  SubjectAnalysisResponseDto,
  SubjectDetailAnalysisDto,
} from './dto/statistics-response.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 성적 추이 조회
   */
  async getTrend(
    studentId: string,
    params?: TrendRequestDto,
  ): Promise<TrendAnalysisDto> {
    // 학생 존재 확인 (memberId로 조회)
    const member = await this.prisma.member.findUnique({
      where: { memberId: toMogoMemberId(studentId) },
    });

    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }
    const numericId = member.id;

    // 점수 조회 (시간순 정렬)
    const whereClause: any = { memberId: numericId };
    if (params?.startYear || params?.endYear) {
      whereClause.mockExam = {};
      if (params.startYear) {
        whereClause.mockExam.year = { gte: params.startYear };
      }
      if (params.endYear) {
        whereClause.mockExam.year = {
          ...whereClause.mockExam.year,
          lte: params.endYear,
        };
      }
    }

    const scores = await this.prisma.studentScore.findMany({
      where: whereClause,
      include: { mockExam: true },
      orderBy: [
        { mockExam: { year: 'asc' } },
        { mockExam: { month: 'asc' } },
      ],
    });

    if (scores.length === 0) {
      return {
        studentId: numericId,
        periodStart: '',
        periodEnd: '',
        totalExams: 0,
        subjects: [],
        overallTrend: [],
      };
    }

    // 과목별 추이 생성
    const subjectTrends: SubjectTrendDto[] = [];

    // 국어
    const koreanData = this.extractSubjectData(scores, 'korean', '국어');
    if (koreanData.dataPoints.length > 0) {
      subjectTrends.push(koreanData);
    }

    // 수학
    const mathData = this.extractSubjectData(scores, 'math', '수학');
    if (mathData.dataPoints.length > 0) {
      subjectTrends.push(mathData);
    }

    // 영어
    const englishData = this.extractSubjectData(scores, 'english', '영어');
    if (englishData.dataPoints.length > 0) {
      subjectTrends.push(englishData);
    }

    // 탐구1
    const inquiry1Data = this.extractSubjectData(scores, 'inquiry1', '탐구1');
    if (inquiry1Data.dataPoints.length > 0) {
      subjectTrends.push(inquiry1Data);
    }

    // 탐구2
    const inquiry2Data = this.extractSubjectData(scores, 'inquiry2', '탐구2');
    if (inquiry2Data.dataPoints.length > 0) {
      subjectTrends.push(inquiry2Data);
    }

    // 전체 평균 등급 추이
    const overallTrend = this.calculateOverallTrend(scores);

    // 기간 계산
    const firstExam = scores[0].mockExam;
    const lastExam = scores[scores.length - 1].mockExam;

    return {
      studentId: numericId,
      periodStart: `${firstExam.year}년 ${firstExam.month}월`,
      periodEnd: `${lastExam.year}년 ${lastExam.month}월`,
      totalExams: scores.length,
      subjects: subjectTrends,
      overallTrend,
    };
  }

  /**
   * 누적 분석
   */
  async getCumulative(
    studentId: string,
    params?: CumulativeRequestDto,
  ): Promise<CumulativeAnalysisDto> {
    const member = await this.prisma.member.findUnique({
      where: { memberId: toMogoMemberId(studentId) },
    });

    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }
    const numericId = member.id;

    const whereClause: any = { memberId: numericId };
    if (params?.startYear || params?.endYear) {
      whereClause.mockExam = {};
      if (params.startYear) {
        whereClause.mockExam.year = { gte: params.startYear };
      }
      if (params.endYear) {
        whereClause.mockExam.year = {
          ...whereClause.mockExam.year,
          lte: params.endYear,
        };
      }
    }

    const scores = await this.prisma.studentScore.findMany({
      where: whereClause,
      include: { mockExam: true },
      orderBy: [
        { mockExam: { year: 'asc' } },
        { mockExam: { month: 'asc' } },
      ],
    });

    if (scores.length === 0) {
      return {
        studentId: numericId,
        totalExams: 0,
        subjectStats: [],
        overallAvgGrade: 0,
        stability: 'low',
        overallTrend: 'stable',
      };
    }

    // 과목별 누적 통계 계산
    const subjectStats: CumulativeStatsDto[] = [];

    const subjects = [
      { key: 'korean', name: '국어' },
      { key: 'math', name: '수학' },
      { key: 'english', name: '영어' },
      { key: 'inquiry1', name: '탐구1' },
      { key: 'inquiry2', name: '탐구2' },
      { key: 'history', name: '한국사' },
    ];

    for (const subj of subjects) {
      const stats = this.calculateSubjectStats(scores, subj.key, subj.name);
      if (stats.examCount > 0) {
        subjectStats.push(stats);
      }
    }

    // 전체 평균 등급
    const allGrades = subjectStats
      .filter((s) => s.avgGrade !== undefined)
      .map((s) => s.avgGrade!);
    const overallAvgGrade =
      allGrades.length > 0
        ? Math.round((allGrades.reduce((a, b) => a + b, 0) / allGrades.length) * 10) / 10
        : 0;

    // 전체 평균 표준점수 합계
    const standardSums = scores
      .filter((s) => s.totalStandardSum)
      .map((s) => s.totalStandardSum!);
    const overallAvgStandardSum =
      standardSums.length > 0
        ? Math.round(standardSums.reduce((a, b) => a + b, 0) / standardSums.length)
        : undefined;

    // 안정성 계산
    const stability = this.calculateStability(subjectStats);

    // 전체 추세 계산
    const overallTrend = this.calculateOverallTrendDirection(scores);

    return {
      studentId: numericId,
      totalExams: scores.length,
      subjectStats,
      overallAvgGrade,
      overallAvgStandardSum,
      stability,
      overallTrend,
    };
  }

  /**
   * 과목별 상세 분석
   */
  async getBySubject(
    studentId: string,
    params?: SubjectAnalysisRequestDto,
  ): Promise<SubjectAnalysisResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { memberId: toMogoMemberId(studentId) },
    });

    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }
    const numericId = member.id;

    const whereClause: any = { memberId: numericId };
    if (params?.startYear || params?.endYear) {
      whereClause.mockExam = {};
      if (params.startYear) {
        whereClause.mockExam.year = { gte: params.startYear };
      }
      if (params.endYear) {
        whereClause.mockExam.year = {
          ...whereClause.mockExam.year,
          lte: params.endYear,
        };
      }
    }

    const scores = await this.prisma.studentScore.findMany({
      where: whereClause,
      include: { mockExam: true },
      orderBy: [
        { mockExam: { year: 'asc' } },
        { mockExam: { month: 'asc' } },
      ],
    });

    const analyses: SubjectDetailAnalysisDto[] = [];

    const subjectMap: { key: string; name: string }[] = [
      { key: 'korean', name: '국어' },
      { key: 'math', name: '수학' },
      { key: 'english', name: '영어' },
      { key: 'inquiry1', name: '탐구1' },
      { key: 'inquiry2', name: '탐구2' },
      { key: 'history', name: '한국사' },
    ];

    // 특정 과목만 요청된 경우 필터링
    const targetSubjects = params?.subject
      ? subjectMap.filter((s) => s.name === params.subject)
      : subjectMap;

    for (const subj of targetSubjects) {
      const analysis = this.createSubjectDetailAnalysis(scores, subj.key, subj.name);
      if (analysis.exams.length > 0) {
        analyses.push(analysis);
      }
    }

    return {
      studentId: numericId,
      requestedSubject: params?.subject,
      analyses,
    };
  }

  // ========== Helper Methods ==========

  private extractSubjectData(
    scores: any[],
    subjectKey: string,
    subjectName: string,
  ): SubjectTrendDto {
    const gradeKey = `${subjectKey}Grade`;
    const percentileKey = `${subjectKey}Percentile`;
    const standardKey = `${subjectKey}Standard`;
    const rawKey = `${subjectKey}Raw`;
    const selectionKey = `${subjectKey}Selection`;

    const dataPoints: ExamDataPointDto[] = [];
    const grades: number[] = [];

    for (const score of scores) {
      if (score[gradeKey] || score[standardKey] || score[rawKey]) {
        const grade = score[gradeKey];
        if (grade) grades.push(grade);

        dataPoints.push({
          mockExamId: score.mockExamId,
          examName: `${score.mockExam.year}년 ${score.mockExam.month}월`,
          year: score.mockExam.year,
          month: score.mockExam.month,
          grade: score[gradeKey] || undefined,
          percentile: score[percentileKey] ? Number(score[percentileKey]) : undefined,
          standardScore: score[standardKey] || undefined,
          rawScore: score[rawKey] || undefined,
        });
      }
    }

    // 선택과목 (가장 최근 것 사용)
    const lastSelection = scores
      .filter((s) => s[selectionKey])
      .pop()?.[selectionKey];

    // 통계 계산
    const avgGrade =
      grades.length > 0
        ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
        : undefined;
    const bestGrade = grades.length > 0 ? Math.min(...grades) : undefined;
    const worstGrade = grades.length > 0 ? Math.max(...grades) : undefined;

    // 추세 계산
    const trend = this.calculateTrend(grades);

    return {
      subject: subjectName,
      selection: lastSelection,
      dataPoints,
      avgGrade,
      bestGrade,
      worstGrade,
      trend,
    };
  }

  private calculateTrend(grades: number[]): 'up' | 'down' | 'stable' {
    if (grades.length < 2) return 'stable';

    const firstHalf = grades.slice(0, Math.floor(grades.length / 2));
    const secondHalf = grades.slice(Math.floor(grades.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    // 등급은 낮을수록 좋음
    const diff = firstAvg - secondAvg;
    if (diff > 0.3) return 'up'; // 등급이 낮아졌으니 상승
    if (diff < -0.3) return 'down'; // 등급이 높아졌으니 하락
    return 'stable';
  }

  private calculateOverallTrend(scores: any[]): ExamDataPointDto[] {
    return scores.map((score) => {
      const grades: number[] = [];
      if (score.koreanGrade) grades.push(score.koreanGrade);
      if (score.mathGrade) grades.push(score.mathGrade);
      if (score.englishGrade) grades.push(score.englishGrade);
      if (score.inquiry1Grade) grades.push(score.inquiry1Grade);
      if (score.inquiry2Grade) grades.push(score.inquiry2Grade);

      const avgGrade =
        grades.length > 0
          ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
          : undefined;

      return {
        mockExamId: score.mockExamId,
        examName: `${score.mockExam.year}년 ${score.mockExam.month}월`,
        year: score.mockExam.year,
        month: score.mockExam.month,
        grade: avgGrade,
        standardScore: score.totalStandardSum || undefined,
        topCumulativeStd: score.topCumulativeStd ? Number(score.topCumulativeStd) : undefined,
        topCumulativeRaw: score.topCumulativeRaw ? Number(score.topCumulativeRaw) : undefined,
      };
    });
  }

  private calculateSubjectStats(
    scores: any[],
    subjectKey: string,
    subjectName: string,
  ): CumulativeStatsDto {
    const gradeKey = `${subjectKey}Grade`;
    const percentileKey = `${subjectKey}Percentile`;
    const standardKey = `${subjectKey}Standard`;

    const grades: number[] = [];
    const percentiles: number[] = [];
    const standardScores: number[] = [];

    for (const score of scores) {
      if (score[gradeKey]) grades.push(score[gradeKey]);
      if (score[percentileKey]) percentiles.push(Number(score[percentileKey]));
      if (score[standardKey]) standardScores.push(score[standardKey]);
    }

    const avgGrade =
      grades.length > 0
        ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
        : undefined;

    const avgPercentile =
      percentiles.length > 0
        ? Math.round((percentiles.reduce((a, b) => a + b, 0) / percentiles.length) * 10) / 10
        : undefined;

    const avgStandardScore =
      standardScores.length > 0
        ? Math.round(standardScores.reduce((a, b) => a + b, 0) / standardScores.length)
        : undefined;

    // 표준편차 계산
    let stdDevGrade: number | undefined;
    if (grades.length > 1 && avgGrade !== undefined) {
      const variance =
        grades.reduce((sum, g) => sum + Math.pow(g - avgGrade, 2), 0) / grades.length;
      stdDevGrade = Math.round(Math.sqrt(variance) * 100) / 100;
    }

    return {
      subject: subjectName,
      examCount: Math.max(grades.length, percentiles.length, standardScores.length),
      avgGrade,
      avgPercentile,
      avgStandardScore,
      bestGrade: grades.length > 0 ? Math.min(...grades) : undefined,
      worstGrade: grades.length > 0 ? Math.max(...grades) : undefined,
      stdDevGrade,
    };
  }

  private calculateStability(stats: CumulativeStatsDto[]): 'high' | 'medium' | 'low' {
    const stdDevs = stats
      .filter((s) => s.stdDevGrade !== undefined)
      .map((s) => s.stdDevGrade!);

    if (stdDevs.length === 0) return 'medium';

    const avgStdDev = stdDevs.reduce((a, b) => a + b, 0) / stdDevs.length;

    if (avgStdDev < 0.5) return 'high';
    if (avgStdDev < 1.0) return 'medium';
    return 'low';
  }

  private calculateOverallTrendDirection(
    scores: any[],
  ): 'improving' | 'declining' | 'stable' {
    if (scores.length < 2) return 'stable';

    const avgGrades = scores.map((score) => {
      const grades: number[] = [];
      if (score.koreanGrade) grades.push(score.koreanGrade);
      if (score.mathGrade) grades.push(score.mathGrade);
      if (score.englishGrade) grades.push(score.englishGrade);
      if (score.inquiry1Grade) grades.push(score.inquiry1Grade);
      if (score.inquiry2Grade) grades.push(score.inquiry2Grade);
      return grades.length > 0
        ? grades.reduce((a, b) => a + b, 0) / grades.length
        : null;
    }).filter((g) => g !== null) as number[];

    if (avgGrades.length < 2) return 'stable';

    const trend = this.calculateTrend(avgGrades);
    if (trend === 'up') return 'improving';
    if (trend === 'down') return 'declining';
    return 'stable';
  }

  private createSubjectDetailAnalysis(
    scores: any[],
    subjectKey: string,
    subjectName: string,
  ): SubjectDetailAnalysisDto {
    const gradeKey = `${subjectKey}Grade`;
    const percentileKey = `${subjectKey}Percentile`;
    const standardKey = `${subjectKey}Standard`;
    const rawKey = `${subjectKey}Raw`;
    const selectionKey = `${subjectKey}Selection`;

    const exams: ExamDataPointDto[] = [];
    const grades: number[] = [];

    for (const score of scores) {
      if (score[gradeKey] || score[standardKey] || score[rawKey]) {
        if (score[gradeKey]) grades.push(score[gradeKey]);

        exams.push({
          mockExamId: score.mockExamId,
          examName: `${score.mockExam.year}년 ${score.mockExam.month}월`,
          year: score.mockExam.year,
          month: score.mockExam.month,
          grade: score[gradeKey] || undefined,
          percentile: score[percentileKey] ? Number(score[percentileKey]) : undefined,
          standardScore: score[standardKey] || undefined,
          rawScore: score[rawKey] || undefined,
        });
      }
    }

    const lastSelection = scores
      .filter((s) => s[selectionKey])
      .pop()?.[selectionKey];

    const percentiles = exams
      .filter((e) => e.percentile)
      .map((e) => e.percentile!);
    const standardScores = exams
      .filter((e) => e.standardScore)
      .map((e) => e.standardScore!);

    const trend = this.calculateTrend(grades);

    // 향상률 계산
    let improvementRate: number | undefined;
    if (grades.length >= 2) {
      const firstGrade = grades[0];
      const lastGrade = grades[grades.length - 1];
      // 등급이 낮아지면 향상
      improvementRate = Math.round(((firstGrade - lastGrade) / firstGrade) * 100);
    }

    const summary = {
      examCount: exams.length,
      avgGrade:
        grades.length > 0
          ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10
          : undefined,
      avgPercentile:
        percentiles.length > 0
          ? Math.round((percentiles.reduce((a, b) => a + b, 0) / percentiles.length) * 10) / 10
          : undefined,
      avgStandardScore:
        standardScores.length > 0
          ? Math.round(standardScores.reduce((a, b) => a + b, 0) / standardScores.length)
          : undefined,
      bestGrade: grades.length > 0 ? Math.min(...grades) : undefined,
      worstGrade: grades.length > 0 ? Math.max(...grades) : undefined,
      trend,
      improvementRate,
    };

    return {
      subject: subjectName,
      selection: lastSelection,
      exams,
      summary,
      recommendation: this.generateSubjectRecommendation(subjectName, summary),
    };
  }

  private generateSubjectRecommendation(
    subject: string,
    summary: SubjectDetailAnalysisDto['summary'],
  ): string {
    const parts: string[] = [];

    if (summary.trend === 'up') {
      parts.push(`${subject} 성적이 꾸준히 향상되고 있습니다.`);
    } else if (summary.trend === 'down') {
      parts.push(`${subject} 성적이 하락 추세입니다. 집중 학습이 필요합니다.`);
    } else {
      parts.push(`${subject} 성적이 안정적으로 유지되고 있습니다.`);
    }

    if (summary.avgGrade !== undefined) {
      if (summary.avgGrade <= 2) {
        parts.push('현재 수준을 유지하며 1등급 도전을 권장합니다.');
      } else if (summary.avgGrade <= 4) {
        parts.push('취약 단원 보완으로 2등급 이내 진입이 가능합니다.');
      } else {
        parts.push('기초 개념 정리와 오답 분석을 권장합니다.');
      }
    }

    return parts.join(' ');
  }
}
