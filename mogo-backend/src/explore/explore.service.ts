import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExploreService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdmissions(yearStr: string, admissionType?: string) {
    const whereClause: any = {};
    if (admissionType && admissionType !== '전체') {
      whereClause.admissionGroup = admissionType;
    }

    const depts = await this.prisma.department.findMany({
      where: whereClause,
      include: {
        university: true,
        simpleCutoffs: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    const year = parseInt(yearStr || '2026', 10);

    return depts.map(d => ({
      id: d.id,
      year: year,
      admissionName: d.admissionType || "정시 보편", 
      admissionType: d.admissionGroup || "전체",
      generalFieldName: d.category || "기타",
      detailedFields: d.subCategory || "",
      recruitmentNumber: d.quota || 0,
      selectionMethod: d.selectionMethod || "수능 100%",
      recruitmentName: d.name,
      csatRatio: "100",
      schoolRecordRatio: "0",
      interviewRatio: "0",
      otherRatio: "0",
      scoreCalculationCode: d.departmentCode,
      csatElements: d.scoreElements,
      csatCombination: d.scoreCombination,
      csatRequired: d.requiredSubjects,
      csatOptional: d.optionalSubjects,
      totalScore: d.university?.totalScore ? parseFloat(d.university.totalScore.toString()) : 1000,
      researchSubjectCount: d.inquiryCount || 1,
      koreanReflectionScore: parseFloat((d.koreanRatio || "0").replace('%','')) || 0,
      mathReflectionScore: parseFloat((d.mathRatio || "0").replace('%','')) || 0,
      englishReflectionScore: parseFloat((d.englishRatio || "0").replace('%','')) || 0,
      researchReflectionScore: parseFloat((d.inquiryRatio || "0").replace('%','')) || 0,
      koreanHistoryReflectionScore: parseFloat((d.historyRatio || "0").replace('%','')) || 0,
      secondForeignLanguageReflectionScore: parseFloat((d.foreignRatio || "0").replace('%','')) || 0,
      
      minCut: d.simpleCutoffs?.[0]?.standardScoreSum ? parseFloat(d.simpleCutoffs[0].standardScoreSum.toString()) : null,
      maxCut: null,
      minCutPercent: null,
      maxCutPercent: null,
      
      englishGradeCriteria: d.simpleCutoffs?.[0]?.englishGrade ? parseFloat(d.simpleCutoffs[0].englishGrade.toString()) : null,
      historyGradeCriteria: d.simpleCutoffs?.[0]?.historyGrade ? parseFloat(d.simpleCutoffs[0].historyGrade.toString()) : null,

      riskPlus5: null,
      riskPlus4: null,
      riskPlus3: null,
      riskPlus2: null,
      riskPlus1: null,
      riskMinus1: null,
      riskMinus2: null,
      riskMinus3: null,
      riskMinus4: null,
      riskMinus5: null,
      
      initialCumulativePercentile: null,
      additionalCumulativePercentile: null,
      
      university: {
        id: d.university?.id || 0,
        name: d.university?.name || "",
        region: d.university?.region || "서울",
        code: d.university?.code || "",
        establishmentType: "사립" // Mock data for missing field
      }
    }));
  }

  async getAdmissionDetail(id: number) {
    const depts = await this.getAdmissions('2026', '전체');
    const dept = depts.find(d => d.id === id);
    if (!dept) return null;
    return {
      ...dept,
      previousResults: []
    };
  }
}
