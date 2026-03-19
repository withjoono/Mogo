import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toExamHubMemberId } from '../common/utils/member-id.util';
import {
  CreateTargetDto,
  UpdateTargetDto,
  ComparisonRequestDto,
} from './dto/target-request.dto';
import {
  TargetListResponseDto,
  TargetUniversityDto,
  TargetComparisonResponseDto,
  TargetComparisonResultDto,
  ExamComparisonDataDto,
} from './dto/target-response.dto';

const MAX_TARGETS = 5;

@Injectable()
export class TargetService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * 목표 대학 목록 조회
   */
  async findByStudent(studentId: string): Promise<TargetListResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { memberId: toExamHubMemberId(studentId) },
    });

    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }
    const numericId = member.id;

    const targets = await this.prisma.studentTarget.findMany({
      where: { memberId: numericId },
      orderBy: { priority: 'asc' },
    });

    // 학과 정보 조회
    const targetDtos: TargetUniversityDto[] = [];

    for (const target of targets) {
      let universityName: string | undefined;
      let departmentName: string | undefined;
      let category: string | undefined;

      if (target.departmentCode) {
        const dept = await this.prisma.department.findUnique({
          where: { code: target.departmentCode },
          include: { university: true },
        });

        if (dept) {
          universityName = dept.university?.name;
          departmentName = dept.name;
          category = dept.category || undefined;
        }
      }

      targetDtos.push({
        id: target.id,
        studentId: target.memberId,
        priority: target.priority,
        departmentCode: target.departmentCode || undefined,
        universityName,
        departmentName,
        category,
        createdAt: target.createdAt.toISOString(),
      });
    }

    return {
      studentId: numericId,
      targets: targetDtos,
      totalCount: targetDtos.length,
      maxCount: MAX_TARGETS,
    };
  }

  /**
   * 목표 대학 추가
   */
  async create(createDto: CreateTargetDto): Promise<TargetUniversityDto> {
    const { studentId, departmentId, priority = 1 } = createDto;

    // 학생 확인 (memberId로 조회)
    const member = await this.prisma.member.findUnique({
      where: { memberId: toExamHubMemberId(studentId) },
    });

    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }

    // 학과 확인
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      include: { university: true },
    });

    if (!department) {
      throw new NotFoundException(`학과 ID ${departmentId}를 찾을 수 없습니다.`);
    }

    // 최대 개수 확인
    const existingCount = await this.prisma.studentTarget.count({
      where: { memberId: member.id },
    });

    if (existingCount >= MAX_TARGETS) {
      throw new BadRequestException(
        `목표 대학은 최대 ${MAX_TARGETS}개까지 등록할 수 있습니다.`,
      );
    }

    // 중복 확인
    const existing = await this.prisma.studentTarget.findFirst({
      where: {
        memberId: member.id,
        departmentCode: department.code,
      },
    });

    if (existing) {
      throw new BadRequestException('이미 등록된 목표 대학입니다.');
    }

    // 생성
    const target = await this.prisma.studentTarget.create({
      data: {
        memberId: member.id,
        departmentCode: department.code,
        priority,
      },
    });

    return {
      id: target.id,
      studentId: target.memberId,
      priority: target.priority,
      departmentCode: target.departmentCode || undefined,
      universityName: department.university?.name,
      departmentName: department.name,
      category: department.category || undefined,
      createdAt: target.createdAt.toISOString(),
    };
  }

  /**
   * 목표 대학 수정
   */
  async update(
    targetId: number,
    updateDto: UpdateTargetDto,
  ): Promise<TargetUniversityDto> {
    const target = await this.prisma.studentTarget.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new NotFoundException(`목표 ID ${targetId}를 찾을 수 없습니다.`);
    }

    const updateData: any = {};

    if (updateDto.priority !== undefined) {
      updateData.priority = updateDto.priority;
    }

    if (updateDto.departmentId !== undefined) {
      const department = await this.prisma.department.findUnique({
        where: { id: updateDto.departmentId },
      });

      if (!department) {
        throw new NotFoundException(
          `학과 ID ${updateDto.departmentId}를 찾을 수 없습니다.`,
        );
      }

      updateData.departmentCode = department.code;
    }

    const updated = await this.prisma.studentTarget.update({
      where: { id: targetId },
      data: updateData,
    });

    // 학과 정보 조회
    let universityName: string | undefined;
    let departmentName: string | undefined;
    let category: string | undefined;

    if (updated.departmentCode) {
      const dept = await this.prisma.department.findUnique({
        where: { code: updated.departmentCode },
        include: { university: true },
      });

      if (dept) {
        universityName = dept.university?.name;
        departmentName = dept.name;
        category = dept.category || undefined;
      }
    }

    return {
      id: updated.id,
      studentId: updated.memberId,
      priority: updated.priority,
      departmentCode: updated.departmentCode || undefined,
      universityName,
      departmentName,
      category,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * 목표 대학 삭제
   */
  async remove(targetId: number): Promise<void> {
    const target = await this.prisma.studentTarget.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      throw new NotFoundException(`목표 ID ${targetId}를 찾을 수 없습니다.`);
    }

    await this.prisma.studentTarget.delete({
      where: { id: targetId },
    });
  }

  /**
   * 목표 대학 비교 분석
   */
  async getComparison(
    studentId: string,
    params?: ComparisonRequestDto,
  ): Promise<TargetComparisonResponseDto> {
    const member = await this.prisma.member.findUnique({
      where: { memberId: toExamHubMemberId(studentId) },
    });

    if (!member) {
      throw new NotFoundException(`학생 ID ${studentId}를 찾을 수 없습니다.`);
    }
    const numericId = member.id;

    // 목표 대학 조회
    const targetWhere: any = { memberId: numericId };
    if (params?.targetId) {
      targetWhere.id = params.targetId;
    }

    const targets = await this.prisma.studentTarget.findMany({
      where: targetWhere,
      orderBy: { priority: 'asc' },
    });

    if (targets.length === 0) {
      return {
        studentId: numericId,
        period: { start: '', end: '' },
        totalExams: 0,
        comparisons: [],
      };
    }

    // 학생 점수 조회
    const scoreWhere: any = { memberId: numericId };
    if (params?.startYear || params?.endYear) {
      scoreWhere.mockExam = {};
      if (params.startYear) {
        scoreWhere.mockExam.year = { gte: params.startYear };
      }
      if (params.endYear) {
        scoreWhere.mockExam.year = {
          ...scoreWhere.mockExam.year,
          lte: params.endYear,
        };
      }
    }

    const scores = await this.prisma.studentScore.findMany({
      where: scoreWhere,
      include: { mockExam: true },
      orderBy: [
        { mockExam: { year: 'asc' } },
        { mockExam: { month: 'asc' } },
      ],
    });

    if (scores.length === 0) {
      return {
        studentId: numericId,
        period: { start: '', end: '' },
        totalExams: 0,
        comparisons: [],
      };
    }

    // 기간 계산
    const firstExam = scores[0].mockExam;
    const lastExam = scores[scores.length - 1].mockExam;

    // 각 목표 대학별 비교 분석
    const comparisons: TargetComparisonResultDto[] = [];

    for (const target of targets) {
      if (!target.departmentCode) continue;

      const dept = await this.prisma.department.findUnique({
        where: { code: target.departmentCode },
        include: { university: true, admissionCutoffs: true },
      });

      if (!dept) continue;

      // 시험별 비교 데이터 생성
      const examComparisons: ExamComparisonDataDto[] = [];
      const scoreDiffs: number[] = [];

      for (const score of scores) {
        // 내 환산 점수 계산 (간략화)
        const myScore = this.calculateConvertedScore(score, dept);
        const myGrade = this.calculateAvgGrade(score);

        // 해당 시험의 입결 데이터 조회
        const cutoff = dept.admissionCutoffs.find(
          (c) => c.mockExamId === score.mockExamId,
        );

        const targetFirstCut = cutoff?.firstCutScore
          ? Number(cutoff.firstCutScore)
          : undefined;
        const targetFinalCut = cutoff?.finalCutScore
          ? Number(cutoff.finalCutScore)
          : undefined;

        const scoreDiff = myScore && targetFirstCut
          ? Math.round((myScore - targetFirstCut) * 100) / 100
          : undefined;

        if (scoreDiff !== undefined) {
          scoreDiffs.push(scoreDiff);
        }

        examComparisons.push({
          mockExamId: score.mockExamId,
          examName: `${score.mockExam.year}년 ${score.mockExam.month}월`,
          year: score.mockExam.year || 0,
          month: score.mockExam.month || 0,
          myScore,
          myGrade,
          targetFirstCut,
          targetFinalCut,
          scoreDiff,
          possibility: this.calculatePossibility(scoreDiff),
        });
      }

      // 평균 점수 차이 및 전체 합격 가능성
      const avgScoreDiff =
        scoreDiffs.length > 0
          ? Math.round(
            (scoreDiffs.reduce((a, b) => a + b, 0) / scoreDiffs.length) * 100,
          ) / 100
          : undefined;

      comparisons.push({
        targetId: target.id,
        priority: target.priority,
        universityName: dept.university?.name || '',
        departmentName: dept.name,
        category: dept.category || undefined,
        examComparisons,
        avgScoreDiff,
        overallPossibility: this.calculatePossibility(avgScoreDiff),
        recommendation: this.generateTargetRecommendation(
          dept.university?.name || '',
          dept.name,
          avgScoreDiff,
        ),
      });
    }

    return {
      studentId: numericId,
      period: {
        start: `${firstExam.year}년 ${firstExam.month}월`,
        end: `${lastExam.year}년 ${lastExam.month}월`,
      },
      totalExams: scores.length,
      comparisons,
    };
  }

  // ========== Helper Methods ==========

  private calculateConvertedScore(score: any, dept: any): number | undefined {
    // 간략화된 환산 점수 계산
    const koreanRatio = this.parseRatio(dept.koreanRatio);
    const mathRatio = this.parseRatio(dept.mathRatio);
    const inquiryRatio = this.parseRatio(dept.inquiryRatio);

    const koreanScore = (score.koreanStandard || 0) * (koreanRatio / 100);
    const mathScore = (score.mathStandard || 0) * (mathRatio / 100);

    const inquiry1 = score.inquiry1Standard || 0;
    const inquiry2 = score.inquiry2Standard || 0;
    const inquiryAvg = inquiry2 ? (inquiry1 + inquiry2) / 2 : inquiry1;
    const inquiryScore = inquiryAvg * (inquiryRatio / 100);

    const total = koreanScore + mathScore + inquiryScore;

    return total > 0 ? Math.round(total * 100) / 100 : undefined;
  }

  private calculateAvgGrade(score: any): number | undefined {
    const grades: number[] = [];
    if (score.koreanGrade) grades.push(score.koreanGrade);
    if (score.mathGrade) grades.push(score.mathGrade);
    if (score.englishGrade) grades.push(score.englishGrade);
    if (score.inquiry1Grade) grades.push(score.inquiry1Grade);
    if (score.inquiry2Grade) grades.push(score.inquiry2Grade);

    if (grades.length === 0) return undefined;

    return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
  }

  private parseRatio(ratio: string | null): number {
    if (!ratio) return 0;
    const parsed = parseFloat(ratio.replace('%', ''));
    return isNaN(parsed) ? 0 : parsed;
  }

  private calculatePossibility(
    scoreDiff?: number,
  ): 'safe' | 'possible' | 'challenging' | 'difficult' | undefined {
    if (scoreDiff === undefined) return undefined;

    if (scoreDiff >= 10) return 'safe';
    if (scoreDiff >= 0) return 'possible';
    if (scoreDiff >= -10) return 'challenging';
    return 'difficult';
  }

  private generateTargetRecommendation(
    universityName: string,
    departmentName: string,
    avgScoreDiff?: number,
  ): string {
    if (avgScoreDiff === undefined) {
      return `${universityName} ${departmentName}의 입결 데이터가 부족합니다.`;
    }

    if (avgScoreDiff >= 10) {
      return `${universityName} ${departmentName}는 안정 지원 가능합니다. 상향 지원도 고려해보세요.`;
    }
    if (avgScoreDiff >= 0) {
      return `${universityName} ${departmentName}는 적정 지원입니다. 현재 수준을 유지하세요.`;
    }
    if (avgScoreDiff >= -10) {
      return `${universityName} ${departmentName}는 소신 지원입니다. 추가 노력이 필요합니다.`;
    }
    return `${universityName} ${departmentName}는 상향 지원입니다. 다른 대안도 함께 준비하세요.`;
  }
}
