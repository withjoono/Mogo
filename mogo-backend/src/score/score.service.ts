import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { toMogoMemberId } from '../common/utils/member-id.util';

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 점수 저장 (upsert)
   */
  async create(createScoreDto: CreateScoreDto) {
    const { studentId, mockExamId, ...scoreData } = createScoreDto;

    // 학생 존재 확인 (memberId로 조회)
    const ehMemberId = toMogoMemberId(studentId);
    const member = await this.prisma.member.findUnique({
      where: { memberId: ehMemberId },
    });
    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }

    // 모의고사 존재 확인
    const mockExam = await this.prisma.mockExam.findUnique({
      where: { id: mockExamId },
    });
    if (!mockExam) {
      throw new NotFoundException(`모의고사 ID ${mockExamId}를 찾을 수 없습니다.`);
    }

    // 자동 계산: 표준점수 합계, 백분위 합계
    const calculatedData = this.calculateTotals(scoreData);

    // Upsert 처리
    return this.prisma.studentScore.upsert({
      where: {
        memberId_mockExamId: {
          memberId: member.id,
          mockExamId,
        },
      },
      update: {
        ...scoreData,
        ...calculatedData,
      },
      create: {
        memberId: member.id,
        mockExamId,
        ...scoreData,
        ...calculatedData,
      },
      include: {
        member: true,
        mockExam: true,
      },
    });
  }

  /**
   * 표준점수 합계 및 백분위 합계 자동 계산
   */
  private calculateTotals(scoreData: Partial<CreateScoreDto>) {
    const calculated: any = {};

    // 국수탐 표준점수 합계
    const standardScores = [
      scoreData.koreanStandard,
      scoreData.mathStandard,
      scoreData.inquiry1Standard,
      scoreData.inquiry2Standard,
    ].filter((s) => s !== undefined && s !== null) as number[];

    if (standardScores.length > 0) {
      calculated.totalStandardSum = standardScores.reduce((sum, s) => sum + s, 0);
    }

    // 국수탐 백분위 합계
    const percentiles = [
      scoreData.koreanPercentile,
      scoreData.mathPercentile,
      scoreData.inquiry1Percentile,
      scoreData.inquiry2Percentile,
    ].filter((p) => p !== undefined && p !== null) as number[];

    if (percentiles.length > 0) {
      calculated.totalPercentileSum = percentiles.reduce((sum, p) => sum + p, 0);
    }

    return calculated;
  }

  /**
   * 학생의 모든 점수 조회
   */
  async findByStudent(studentId: string) {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    if (!member) return [];
    const scores = await this.prisma.studentScore.findMany({
      where: { memberId: member.id },
      include: {
        mockExam: true,
      },
    });
    // Prisma 7 driver adapter에서 relation orderBy 미지원 → 앱 레벨 정렬
    return scores.sort((a, b) => {
      const yearDiff = (b.mockExam?.year ?? 0) - (a.mockExam?.year ?? 0);
      if (yearDiff !== 0) return yearDiff;
      return (b.mockExam?.month ?? 0) - (a.mockExam?.month ?? 0);
    });
  }

  /**
   * 특정 학생의 특정 모의고사 점수 조회
   */
  async findOne(studentId: string, mockExamId: number) {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    if (!member) {
      return null;
    }
    const score = await this.prisma.studentScore.findUnique({
      where: {
        memberId_mockExamId: {
          memberId: member.id,
          mockExamId,
        },
      },
      include: {
        member: true,
        mockExam: true,
      },
    });

    return score;
  }

  /**
   * 점수 ID로 조회
   */
  async findById(id: number) {
    const score = await this.prisma.studentScore.findUnique({
      where: { id },
      include: {
        member: true,
        mockExam: true,
      },
    });

    if (!score) {
      throw new NotFoundException(`점수 ID ${id}를 찾을 수 없습니다.`);
    }

    return score;
  }

  /**
   * 점수 수정
   */
  async update(id: number, updateScoreDto: UpdateScoreDto) {
    const score = await this.findById(id);

    const calculatedData = this.calculateTotals(updateScoreDto);

    return this.prisma.studentScore.update({
      where: { id },
      data: {
        ...updateScoreDto,
        ...calculatedData,
      },
      include: {
        member: true,
        mockExam: true,
      },
    });
  }

  /**
   * 점수 삭제
   */
  async remove(id: number) {
    await this.findById(id); // 존재 확인

    return this.prisma.studentScore.delete({
      where: { id },
    });
  }

  /**
   * 학생의 최근 점수 조회
   */
  async findLatestByStudent(studentId: string) {
    const member = await this.prisma.member.findUnique({ where: { memberId: toMogoMemberId(studentId) } });
    if (!member) return null;
    const scores = await this.prisma.studentScore.findMany({
      where: { memberId: member.id },
      include: {
        mockExam: true,
      },
    });
    // Prisma 7 driver adapter에서 relation orderBy 미지원 → 앱 레벨 정렬
    scores.sort((a, b) => {
      const yearDiff = (b.mockExam?.year ?? 0) - (a.mockExam?.year ?? 0);
      if (yearDiff !== 0) return yearDiff;
      return (b.mockExam?.month ?? 0) - (a.mockExam?.month ?? 0);
    });
    return scores[0] ?? null;
  }

  /**
   * 점수 변환표 조회 (표준점수 → 백분위/등급)
   */
  async getScoreConversion(mockExamId: number, subject: string) {
    return this.prisma.scoreConversion2015.findMany({
      where: { mockExamId, subject },
      orderBy: { standardScore: 'desc' },
    });
  }

  /**
   * 원점수 변환표 조회 (원점수 → 표준점수)
   */
  async getRawScoreConversion(mockExamId: number, subject: string, subjectType?: string) {
    const where: any = { mockExamId, subject };
    if (subjectType) where.subjectType = subjectType;

    return this.prisma.scoreConversionRaw2015.findMany({
      where,
      orderBy: { standardScore: 'desc' },
    });
  }

  /**
   * 상위누적백분위 조회
   */
  async getCumulativeTopPct(mockExamId: number, standardSum: number, englishGrade: number) {
    const row = await this.prisma.cumulativeTopPct2015.findUnique({
      where: { mockExamId_standardSum: { mockExamId, standardSum } },
    });

    if (!row) return null;

    // 영어등급 컬럼 매핑
    const engColumns: Record<number, any> = {
      1: row.topPctEnglish1,
      2: row.topPctEnglish2,
      3: row.topPctEnglish3,
      4: row.topPctEnglish4,
      5: row.topPctEnglish5,
      6: row.topPctEnglish6,
      7: row.topPctEnglish7,
      8: row.topPctEnglish8,
      9: row.topPctEnglish9,
    };

    return {
      standardSum,
      topPctBase: Number(row.topPctBase),
      topPctWithEnglish: engColumns[englishGrade] != null ? Number(engColumns[englishGrade]) : null,
      englishGrade,
    };
  }

  /**
   * 학생 성적 자동 변환 파이프라인
   * 
   * 두 가지 경로:
   * A) 표준점수가 있으면 → 백분위/등급 조회 + 표점합 → 누백 (topCumulativeStd)
   * B) 원점수만 있으면 → 표점 변환 → 표점합 → 누백 (topCumulativeRaw) / 백분위/등급 스킵
   * 
   * 우선순위: 표준점수 > 원점수 (둘 다 있으면 표준점수만 사용)
   */
  async calculateConvertedScores(memberId: number, mockExamId: number) {
    const score = await this.prisma.studentScore.findUnique({
      where: { memberId_mockExamId: { memberId, mockExamId } },
    });
    if (!score) return null;

    const updateData: any = {};

    // === 과목별 매핑 정의 (국수탐: 표점 변환 대상) ===
    const subjectDefs = [
      { stdField: 'koreanStandard', rawField: 'koreanRaw', pctField: 'koreanPercentile', gradeField: 'koreanGrade', subject: '국어', selectionField: 'koreanSelection', areaName: '국어' },
      { stdField: 'mathStandard', rawField: 'mathRaw', pctField: 'mathPercentile', gradeField: 'mathGrade', subject: '수학', selectionField: 'mathSelection', areaName: '수학' },
      { stdField: 'inquiry1Standard', rawField: 'inquiry1Raw', pctField: 'inquiry1Percentile', gradeField: 'inquiry1Grade', subject: null, selectionField: 'inquiry1Selection', areaName: null },
      { stdField: 'inquiry2Standard', rawField: 'inquiry2Raw', pctField: 'inquiry2Percentile', gradeField: 'inquiry2Grade', subject: null, selectionField: 'inquiry2Selection', areaName: null },
    ];

    // === 등급 변환 과목 (표점 없이 원점수→등급만) ===
    const gradeDefs = [
      { rawField: 'englishRaw', gradeField: 'englishGrade', subject: '영어', areaName: '영어' },
      { rawField: 'historyRaw', gradeField: 'historyGrade', subject: '한국사', areaName: '사회탐구' },
      { rawField: 'foreignRaw', gradeField: 'foreignGrade', subject: null, selectionField: 'foreignSelection', areaName: '제2외국어' },
    ];

    // 표준점수 합산용 (경로별 분리)
    const stdScoresForStd: number[] = []; // 경로A: 실제 표준점수
    const stdScoresForRaw: number[] = []; // 경로B: 원점수→변환 표점
    let hasAnyStandard = false;
    let hasAnyRaw = false;

    for (const def of subjectDefs) {
      const standardScore = (score as any)[def.stdField];
      const rawScore = (score as any)[def.rawField];
      const subjectName = def.subject || (score as any)[def.selectionField];

      if (standardScore != null) {
        // === 경로 A: 표준점수 존재 → 백분위/등급 조회 ===
        hasAnyStandard = true;
        stdScoresForStd.push(standardScore);

        if (subjectName) {
          const conversion = await this.prisma.scoreConversion2015.findFirst({
            where: { mockExamId, subject: subjectName, standardScore },
          });
          if (conversion) {
            if (conversion.percentile != null) updateData[def.pctField] = Number(conversion.percentile);
            if (conversion.grade != null) updateData[def.gradeField] = conversion.grade;
          }
        }
      } else if (rawScore != null && subjectName) {
        // === 경로 B: 원점수만 존재 → 표점 변환 + 백분위/등급 조회 ===
        hasAnyRaw = true;
        const areaName = def.areaName || (score as any)[def.selectionField];

        // 원점수 → 표점 변환 조회 (exact match 먼저, 없으면 max 사용)
        let rawConversion = await this.prisma.scoreConversionRaw2015.findFirst({
          where: { mockExamId, subject: areaName, subjectType: subjectName, commonScore: rawScore },
        });

        // 원점수가 테이블 범위를 초과 → 최고 표점 사용
        if (!rawConversion) {
          rawConversion = await this.prisma.scoreConversionRaw2015.findFirst({
            where: { mockExamId, subject: areaName, subjectType: subjectName },
            orderBy: { standardScore: 'desc' },
          });
        }

        if (rawConversion?.standardScore != null) {
          const convertedStd = rawConversion.standardScore;
          stdScoresForRaw.push(convertedStd);
          updateData[def.stdField] = convertedStd;

          // 변환된 표점으로 백분위/등급 조회 (scoreConversion2015)
          let stdConversion = await this.prisma.scoreConversion2015.findFirst({
            where: { mockExamId, subject: subjectName, standardScore: convertedStd },
          });

          // 표점이 변환표 범위 초과 → 최고점 엔트리 사용
          if (!stdConversion) {
            stdConversion = await this.prisma.scoreConversion2015.findFirst({
              where: { mockExamId, subject: subjectName },
              orderBy: { standardScore: 'desc' },
            });
          }

          if (stdConversion) {
            if (stdConversion.percentile != null) updateData[def.pctField] = Number(stdConversion.percentile);
            if (stdConversion.grade != null) updateData[def.gradeField] = stdConversion.grade;
          }
        }
      }
    }

    // === 등급 과목 처리 (영어/한국사/외국어): 원점수→등급 변환 ===
    for (const gDef of gradeDefs) {
      const rawScore = (score as any)[gDef.rawField];
      const existingGrade = (score as any)[gDef.gradeField];

      // 이미 등급이 입력되어 있으면 스킵 (사용자 직접 입력 우선)
      if (existingGrade != null) continue;
      if (rawScore == null) continue;

      const subjectName = gDef.subject || (score as any)[(gDef as any).selectionField];
      if (!subjectName) continue;

      // 원점수 → 등급 조회 (standard_score에 등급이 저장됨)
      const gradeConversion = await this.prisma.scoreConversionRaw2015.findFirst({
        where: { mockExamId, subject: gDef.areaName, subjectType: subjectName, commonScore: rawScore },
      });

      if (gradeConversion?.standardScore != null) {
        updateData[gDef.gradeField] = gradeConversion.standardScore;
      }
    }

    // === 합계 계산 ===
    // 영어등급: 업데이트된 값 또는 기존 값
    const englishGrade = updateData.englishGrade ?? (score as any).englishGrade;

    if (hasAnyStandard && stdScoresForStd.length > 0) {
      // 경로 A: 표준점수 기반
      const totalStdSum = stdScoresForStd.reduce((sum, s) => sum + s, 0);
      updateData.totalStandardSum = totalStdSum;

      // 백분위 합계
      const pctFields = ['koreanPercentile', 'mathPercentile', 'inquiry1Percentile', 'inquiry2Percentile'];
      const pcts = pctFields
        .map(f => updateData[f] ?? (score as any)[f])
        .filter(p => p != null)
        .map(Number);
      if (pcts.length > 0) {
        updateData.totalPercentileSum = pcts.reduce((sum, p) => sum + p, 0);
      }

      // 상위누백 (topCumulativeStd)
      if (englishGrade != null) {
        const cumResult = await this.getCumulativeTopPct(mockExamId, totalStdSum, englishGrade);
        if (cumResult?.topPctWithEnglish != null) {
          updateData.topCumulativeStd = cumResult.topPctWithEnglish;
        }
      }
    }

    if (hasAnyRaw && !hasAnyStandard && stdScoresForRaw.length > 0) {
      // 경로 B: 원점수→변환표점 기반 (표준점수가 없을 때만)
      const totalRawStdSum = stdScoresForRaw.reduce((sum, s) => sum + s, 0);
      updateData.totalStandardSum = totalRawStdSum;

      // 백분위 합계 (경로B에서도 백분위가 산출되므로)
      const pctFields = ['koreanPercentile', 'mathPercentile', 'inquiry1Percentile', 'inquiry2Percentile'];
      const pcts = pctFields
        .map(f => updateData[f] ?? (score as any)[f])
        .filter(p => p != null)
        .map(Number);
      if (pcts.length > 0) {
        updateData.totalPercentileSum = pcts.reduce((sum, p) => sum + p, 0);
      }

      // 상위누백 (topCumulativeRaw) — 임시 성격
      if (englishGrade != null) {
        const cumResult = await this.getCumulativeTopPct(mockExamId, totalRawStdSum, englishGrade);
        if (cumResult?.topPctWithEnglish != null) {
          updateData.topCumulativeRaw = cumResult.topPctWithEnglish;
        }
      }
    }

    // === 저장 ===
    if (Object.keys(updateData).length > 0) {
      return this.prisma.studentScore.update({
        where: { memberId_mockExamId: { memberId, mockExamId } },
        data: updateData,
        include: { member: true, mockExam: true },
      });
    }

    return score;
  }
}










