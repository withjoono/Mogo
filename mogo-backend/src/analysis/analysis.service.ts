import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReflectionAnalysisRequestDto,
  CombinationAnalysisRequestDto,
  AchievementAnalysisRequestDto,
} from './dto/analysis-request.dto';
import {
  ScoreSummaryDto,
  SubjectScoreDto,
  ReflectionAnalysisDto,
  ReflectionResultDto,
  CombinationAnalysisDto,
  CombinationResultDto,
  AchievementAnalysisDto,
} from './dto/analysis-response.dto';

@Injectable()
export class AnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 성적 요약 조회
   */
  async getSummary(scoreId: number): Promise<ScoreSummaryDto> {
    const score = await this.prisma.studentScore.findUnique({
      where: { id: scoreId },
      include: { mockExam: true },
    });

    if (!score) {
      throw new NotFoundException(`점수 ID ${scoreId}를 찾을 수 없습니다.`);
    }

    const subjects: SubjectScoreDto[] = [];

    // 국어
    if (score.koreanStandard || score.koreanRaw || score.koreanGrade) {
      subjects.push({
        subject: '국어',
        selection: score.koreanSelection || undefined,
        rawScore: score.koreanRaw || undefined,
        standardScore: score.koreanStandard || undefined,
        percentile: score.koreanPercentile
          ? Number(score.koreanPercentile)
          : undefined,
        grade: score.koreanGrade || undefined,
      });
    }

    // 수학
    if (score.mathStandard || score.mathRaw || score.mathGrade) {
      subjects.push({
        subject: '수학',
        selection: score.mathSelection || undefined,
        rawScore: score.mathRaw || undefined,
        standardScore: score.mathStandard || undefined,
        percentile: score.mathPercentile
          ? Number(score.mathPercentile)
          : undefined,
        grade: score.mathGrade || undefined,
      });
    }

    // 영어
    if (score.englishGrade || score.englishRaw) {
      subjects.push({
        subject: '영어',
        rawScore: score.englishRaw || undefined,
        grade: score.englishGrade || undefined,
      });
    }

    // 한국사
    if (score.historyGrade || score.historyRaw) {
      subjects.push({
        subject: '한국사',
        rawScore: score.historyRaw || undefined,
        grade: score.historyGrade || undefined,
      });
    }

    // 탐구1
    if (score.inquiry1Standard || score.inquiry1Raw || score.inquiry1Grade) {
      subjects.push({
        subject: '탐구1',
        selection: score.inquiry1Selection || undefined,
        rawScore: score.inquiry1Raw || undefined,
        standardScore: score.inquiry1Standard || undefined,
        percentile: score.inquiry1Percentile
          ? Number(score.inquiry1Percentile)
          : undefined,
        grade: score.inquiry1Grade || undefined,
      });
    }

    // 탐구2
    if (score.inquiry2Standard || score.inquiry2Raw || score.inquiry2Grade) {
      subjects.push({
        subject: '탐구2',
        selection: score.inquiry2Selection || undefined,
        rawScore: score.inquiry2Raw || undefined,
        standardScore: score.inquiry2Standard || undefined,
        percentile: score.inquiry2Percentile
          ? Number(score.inquiry2Percentile)
          : undefined,
        grade: score.inquiry2Grade || undefined,
      });
    }

    // 제2외국어
    if (score.foreignGrade || score.foreignRaw) {
      subjects.push({
        subject: '제2외국어',
        selection: score.foreignSelection || undefined,
        rawScore: score.foreignRaw || undefined,
        grade: score.foreignGrade || undefined,
      });
    }

    return {
      scoreId: score.id,
      mockExam: {
        id: score.mockExam.id,
        code: score.mockExam.code,
        name: score.mockExam.name,
        year: score.mockExam.year || 0,
        month: score.mockExam.month || 0,
        grade: score.mockExam.grade || '',
      },
      subjects,
      totalStandardSum: score.totalStandardSum || 0,
      totalPercentileSum: score.totalPercentileSum
        ? Number(score.totalPercentileSum)
        : undefined,
      topCumulativeStd: score.topCumulativeStd
        ? Number(score.topCumulativeStd)
        : undefined,
    };
  }

  /**
   * 반영비율 분석
   */
  async getReflectionAnalysis(
    scoreId: number,
    params?: ReflectionAnalysisRequestDto,
  ): Promise<ReflectionAnalysisDto> {
    const score = await this.prisma.studentScore.findUnique({
      where: { id: scoreId },
      include: { mockExam: true },
    });

    if (!score) {
      throw new NotFoundException(`점수 ID ${scoreId}를 찾을 수 없습니다.`);
    }

    // 샘플 대학 또는 지정된 학과 조회
    let departments;
    if (params?.departmentIds && params.departmentIds.length > 0) {
      departments = await this.prisma.department.findMany({
        where: { id: { in: params.departmentIds } },
        include: { university: true },
      });
    } else {
      // 샘플 대학 조회 (상위 대학 10개)
      departments = await this.prisma.department.findMany({
        where: {
          koreanRatio: { not: null },
          mathRatio: { not: null },
        },
        include: { university: true },
        take: 10,
      });
    }

    const originalScores = this.extractSubjectScores(score);

    const results: ReflectionResultDto[] = departments.map((dept) => {
      const koreanRatio = this.parseRatio(dept.koreanRatio);
      const mathRatio = this.parseRatio(dept.mathRatio);
      const englishRatio = this.parseRatio(dept.englishRatio);
      const inquiryRatio = this.parseRatio(dept.inquiryRatio);

      // 환산 점수 계산 (1000점 만점 기준)
      const koreanScore = (score.koreanStandard || 0) * (koreanRatio / 100);
      const mathScore = (score.mathStandard || 0) * (mathRatio / 100);

      // 탐구 평균
      const inquiry1 = score.inquiry1Standard || 0;
      const inquiry2 = score.inquiry2Standard || 0;
      const inquiryAvg = inquiry2 ? (inquiry1 + inquiry2) / 2 : inquiry1;
      const inquiryScore = inquiryAvg * (inquiryRatio / 100);

      // 영어 등급 감점
      const englishDeduction = this.calculateEnglishDeduction(
        score.englishGrade || 1,
        dept,
      );
      const englishScore =
        (100 - englishDeduction) * (englishRatio / 100);

      // 총점 (간략 계산 - 실제로는 대학별 상세 로직 필요)
      const rawTotal = koreanScore + mathScore + inquiryScore + englishScore;

      // 1000점 환산 (대학별 환산율 적용)
      const conversionRate = dept.university?.conversionRate
        ? Number(dept.university.conversionRate)
        : 1;
      const convertedScore = Math.round(rawTotal * conversionRate * 100) / 100;

      return {
        universityName: dept.university?.name || '알 수 없음',
        departmentName: dept.name,
        koreanRatio,
        mathRatio,
        englishRatio,
        inquiryRatio,
        convertedScore,
        englishDeduction,
        estimatedGrade: this.estimateGrade(convertedScore),
      };
    });

    // 환산 점수 기준 정렬
    results.sort((a, b) => b.convertedScore - a.convertedScore);

    return {
      scoreId,
      originalScores,
      results,
    };
  }

  /**
   * 조합별 분석
   */
  async getCombinationAnalysis(
    scoreId: number,
    params?: CombinationAnalysisRequestDto,
  ): Promise<CombinationAnalysisDto> {
    const score = await this.prisma.studentScore.findUnique({
      where: { id: scoreId },
    });

    if (!score) {
      throw new NotFoundException(`점수 ID ${scoreId}를 찾을 수 없습니다.`);
    }

    // 기본 조합 정의
    const defaultCombinations = ['국수탐', '국영탐', '수영탐', '국수영', '국수영탐'];
    const targetCombinations = params?.combinations || defaultCombinations;

    const combinations: CombinationResultDto[] = [];

    for (const combName of targetCombinations) {
      const result = this.calculateCombination(combName, score);
      if (result) {
        combinations.push(result);
      }
    }

    // 표준점수 합계 기준 정렬
    combinations.sort((a, b) => b.totalStandardScore - a.totalStandardScore);

    return {
      scoreId,
      combinations,
    };
  }

  /**
   * 성취수준 분석
   */
  async getAchievementAnalysis(
    scoreId: number,
  ): Promise<AchievementAnalysisDto> {
    const score = await this.prisma.studentScore.findUnique({
      where: { id: scoreId },
    });

    if (!score) {
      throw new NotFoundException(`점수 ID ${scoreId}를 찾을 수 없습니다.`);
    }

    const achievements: AchievementAnalysisDto['achievements'] = [];

    // 국어
    if (score.koreanGrade) {
      achievements.push(
        this.createAchievementItem('국어', score.koreanGrade, score.koreanPercentile),
      );
    }

    // 수학
    if (score.mathGrade) {
      achievements.push(
        this.createAchievementItem('수학', score.mathGrade, score.mathPercentile),
      );
    }

    // 영어
    if (score.englishGrade) {
      achievements.push(this.createAchievementItem('영어', score.englishGrade));
    }

    // 한국사
    if (score.historyGrade) {
      achievements.push(this.createAchievementItem('한국사', score.historyGrade));
    }

    // 탐구1
    if (score.inquiry1Grade) {
      achievements.push(
        this.createAchievementItem(
          score.inquiry1Selection || '탐구1',
          score.inquiry1Grade,
          score.inquiry1Percentile,
        ),
      );
    }

    // 탐구2
    if (score.inquiry2Grade) {
      achievements.push(
        this.createAchievementItem(
          score.inquiry2Selection || '탐구2',
          score.inquiry2Grade,
          score.inquiry2Percentile,
        ),
      );
    }

    // 전체 평가
    const grades = achievements.map((a) => a.grade);
    const avgGrade =
      grades.length > 0
        ? Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) /
          10
        : 0;

    const strongSubjects = achievements
      .filter((a) => a.grade <= 2)
      .map((a) => a.subject);
    const weakSubjects = achievements
      .filter((a) => a.grade >= 5)
      .map((a) => a.subject);

    return {
      scoreId,
      achievements,
      overallAssessment: {
        avgGrade,
        strongSubjects,
        weakSubjects,
        recommendation: this.generateRecommendation(avgGrade, strongSubjects, weakSubjects),
      },
    };
  }

  // ========== Helper Methods ==========

  private extractSubjectScores(score: any): SubjectScoreDto[] {
    const subjects: SubjectScoreDto[] = [];

    if (score.koreanStandard || score.koreanGrade) {
      subjects.push({
        subject: '국어',
        selection: score.koreanSelection,
        standardScore: score.koreanStandard,
        percentile: score.koreanPercentile ? Number(score.koreanPercentile) : undefined,
        grade: score.koreanGrade,
      });
    }

    if (score.mathStandard || score.mathGrade) {
      subjects.push({
        subject: '수학',
        selection: score.mathSelection,
        standardScore: score.mathStandard,
        percentile: score.mathPercentile ? Number(score.mathPercentile) : undefined,
        grade: score.mathGrade,
      });
    }

    if (score.englishGrade) {
      subjects.push({
        subject: '영어',
        grade: score.englishGrade,
      });
    }

    if (score.inquiry1Standard || score.inquiry1Grade) {
      subjects.push({
        subject: '탐구1',
        selection: score.inquiry1Selection,
        standardScore: score.inquiry1Standard,
        percentile: score.inquiry1Percentile ? Number(score.inquiry1Percentile) : undefined,
        grade: score.inquiry1Grade,
      });
    }

    if (score.inquiry2Standard || score.inquiry2Grade) {
      subjects.push({
        subject: '탐구2',
        selection: score.inquiry2Selection,
        standardScore: score.inquiry2Standard,
        percentile: score.inquiry2Percentile ? Number(score.inquiry2Percentile) : undefined,
        grade: score.inquiry2Grade,
      });
    }

    return subjects;
  }

  private parseRatio(ratio: string | null): number {
    if (!ratio) return 0;
    const parsed = parseFloat(ratio.replace('%', ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private calculateEnglishDeduction(grade: number, dept: any): number {
    const gradeMap: Record<number, string> = {
      1: 'englishGrade1',
      2: 'englishGrade2',
      3: 'englishGrade3',
      4: 'englishGrade4',
      5: 'englishGrade5',
      6: 'englishGrade6',
      7: 'englishGrade7',
      8: 'englishGrade8',
      9: 'englishGrade9',
    };

    const fieldName = gradeMap[grade];
    if (fieldName && dept[fieldName]) {
      const score = Number(dept[fieldName]);
      // 100점 만점 기준 감점 계산
      return 100 - score;
    }

    // 기본 감점 (등급당 0.5점씩)
    return (grade - 1) * 0.5;
  }

  private estimateGrade(convertedScore: number): string {
    // 간략한 등급 추정 (실제로는 대학별 상세 기준 필요)
    if (convertedScore >= 950) return '안정';
    if (convertedScore >= 900) return '적정';
    if (convertedScore >= 850) return '소신';
    if (convertedScore >= 800) return '상향';
    return '도전';
  }

  private calculateCombination(
    combName: string,
    score: any,
  ): CombinationResultDto | null {
    const subjectMap: Record<string, () => { standard: number; percentile?: number; grade?: number }> = {
      '국': () => ({
        standard: score.koreanStandard || 0,
        percentile: score.koreanPercentile ? Number(score.koreanPercentile) : undefined,
        grade: score.koreanGrade,
      }),
      '수': () => ({
        standard: score.mathStandard || 0,
        percentile: score.mathPercentile ? Number(score.mathPercentile) : undefined,
        grade: score.mathGrade,
      }),
      '영': () => ({
        standard: 0, // 영어는 등급제라 표준점수 없음
        percentile: undefined,
        grade: score.englishGrade,
      }),
      '탐': () => {
        const inq1 = score.inquiry1Standard || 0;
        const inq2 = score.inquiry2Standard || 0;
        const pct1 = score.inquiry1Percentile ? Number(score.inquiry1Percentile) : 0;
        const pct2 = score.inquiry2Percentile ? Number(score.inquiry2Percentile) : 0;
        const grade1 = score.inquiry1Grade || 0;
        const grade2 = score.inquiry2Grade || 0;
        return {
          standard: inq1 + inq2,
          percentile: pct1 && pct2 ? (pct1 + pct2) / 2 : pct1 || pct2,
          grade: grade1 && grade2 ? (grade1 + grade2) / 2 : grade1 || grade2,
        };
      },
    };

    const subjects: string[] = [];
    let totalStandard = 0;
    const percentiles: number[] = [];
    const grades: number[] = [];

    for (const char of combName) {
      const getter = subjectMap[char];
      if (getter) {
        const data = getter();
        subjects.push(this.getFullSubjectName(char));
        totalStandard += data.standard;
        if (data.percentile) percentiles.push(data.percentile);
        if (data.grade) grades.push(data.grade);
      }
    }

    if (subjects.length === 0) return null;

    return {
      combinationName: combName,
      subjects,
      totalStandardScore: totalStandard,
      avgPercentile:
        percentiles.length > 0
          ? Math.round(
              (percentiles.reduce((a, b) => a + b, 0) / percentiles.length) * 10,
            ) / 10
          : undefined,
      avgGrade:
        grades.length > 0
          ? Math.round(
              (grades.reduce((a, b) => a + b, 0) / grades.length) * 10,
            ) / 10
          : undefined,
    };
  }

  private getFullSubjectName(char: string): string {
    const map: Record<string, string> = {
      '국': '국어',
      '수': '수학',
      '영': '영어',
      '탐': '탐구',
    };
    return map[char] || char;
  }

  private createAchievementItem(
    subject: string,
    grade: number,
    percentile?: any,
  ): AchievementAnalysisDto['achievements'][0] {
    const status = this.getAchievementStatus(grade);
    return {
      subject,
      grade,
      gradeLabel: `${grade}등급`,
      percentile: percentile ? Number(percentile) : undefined,
      status,
      message: this.getAchievementMessage(subject, grade, status),
    };
  }

  private getAchievementStatus(
    grade: number,
  ): 'excellent' | 'good' | 'average' | 'belowAverage' | 'needsImprovement' {
    if (grade <= 1) return 'excellent';
    if (grade <= 2) return 'good';
    if (grade <= 4) return 'average';
    if (grade <= 6) return 'belowAverage';
    return 'needsImprovement';
  }

  private getAchievementMessage(
    subject: string,
    grade: number,
    status: string,
  ): string {
    const messages: Record<string, string> = {
      excellent: `${subject} ${grade}등급으로 최상위권입니다. 현재 수준을 유지하세요.`,
      good: `${subject} ${grade}등급으로 우수한 성적입니다. 1등급 도전이 가능합니다.`,
      average: `${subject} ${grade}등급으로 평균 수준입니다. 취약 단원 보완이 필요합니다.`,
      belowAverage: `${subject} ${grade}등급으로 보완이 필요합니다. 기초 개념 정리를 권장합니다.`,
      needsImprovement: `${subject} ${grade}등급으로 집중 학습이 필요합니다. 기본 개념부터 다시 학습하세요.`,
    };
    return messages[status] || '';
  }

  private generateRecommendation(
    avgGrade: number,
    strongSubjects: string[],
    weakSubjects: string[],
  ): string {
    const parts: string[] = [];

    if (avgGrade <= 2) {
      parts.push('전체적으로 우수한 성적입니다.');
    } else if (avgGrade <= 4) {
      parts.push('평균적인 수준이며 상승 여력이 있습니다.');
    } else {
      parts.push('전반적인 성적 향상이 필요합니다.');
    }

    if (strongSubjects.length > 0) {
      parts.push(`강점 과목: ${strongSubjects.join(', ')}`);
    }

    if (weakSubjects.length > 0) {
      parts.push(`보완 필요 과목: ${weakSubjects.join(', ')}`);
    }

    return parts.join(' ');
  }
}
