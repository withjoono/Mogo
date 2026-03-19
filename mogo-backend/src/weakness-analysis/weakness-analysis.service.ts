import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toExamHubMemberId } from '../common/utils/member-id.util';

export interface DimensionStat {
    label: string;
    totalCount: number;
    wrongCount: number;
    wrongRate: number;
}

export interface SubjectWeaknessData {
    subject: string;
    totalCount: number;
    wrongCount: number;
    wrongRate: number;
    bySubSubject: DimensionStat[];
    byDifficulty: DimensionStat[];
    byQuestionType: DimensionStat[];
    byQuestionForm: DimensionStat[];
    byMajorChapter: DimensionStat[];
    byScore: DimensionStat[];
}

@Injectable()
export class WeaknessAnalysisService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * 학생이 데이터를 가진 과목 목록 조회
     */
    async getAvailableSubjects(studentId: string): Promise<string[]> {
        const member = await this.prisma.member.findUnique({
            where: { memberId: toExamHubMemberId(studentId) },
        });
        if (!member) return [];

        // StudentAnswer에서 해당 학생이 보유한 과목 영역 추출
        const subjects = await this.prisma.studentAnswer.findMany({
            where: { memberId: member.id },
            select: { subjectAreaName: true },
            distinct: ['subjectAreaName'],
        });

        return subjects
            .map((s) => s.subjectAreaName)
            .filter((s): s is string => !!s);
    }

    /**
     * 특정 과목에 대한 취약점 분석
     */
    async getWeaknessAnalysis(
        studentId: string,
        subject: string,
    ): Promise<SubjectWeaknessData | null> {
        const member = await this.prisma.member.findUnique({
            where: { memberId: toExamHubMemberId(studentId) },
        });
        if (!member) return null;

        // 1. 해당 과목의 모든 학생 답안 조회 (오답 포함 전체)
        const answers = await this.prisma.studentAnswer.findMany({
            where: {
                memberId: member.id,
                subjectAreaName: subject,
            },
            select: {
                mockExamId: true,
                questionNumber: true,
                isCorrect: true,
                score: true,
                subjectAreaName: true,
                subjectName: true,
            },
        });

        if (answers.length === 0) return null;

        // 2. 해당 답안들에 대응하는 QuestionCategory2015 데이터 조회
        //    (mockExamId + subject + questionNumber 기준으로 매칭)
        const mockExamIds = [...new Set(answers.map((a) => a.mockExamId))];
        const categories = await this.prisma.questionCategory2015.findMany({
            where: {
                mockExamId: { in: mockExamIds },
                subject: subject,
            },
        });

        // 카테고리 룩업 맵 생성
        const catMap = new Map<string, (typeof categories)[0]>();
        for (const cat of categories) {
            catMap.set(`${cat.mockExamId}-${cat.questionNumber}`, cat);
        }

        // 3. 답안과 카테고리를 매칭하여 분석 데이터 생성
        const enrichedAnswers = answers.map((a) => {
            const cat = catMap.get(`${a.mockExamId}-${a.questionNumber}`);
            return {
                ...a,
                subSubject: cat?.subSubject || null,
                questionType: cat?.questionType || null,
                questionForm: cat?.questionForm || null,
                majorChapter: cat?.majorChapter || null,
                minorChapter: cat?.minorChapter || null,
                categoryScore: cat?.score || a.score || null,
                difficulty: null as string | null, // ExamQuestion에서 가져와야 함
            };
        });

        // ExamQuestion에서 난이도 가져오기
        const examQuestions = await this.prisma.examQuestion.findMany({
            where: {
                mockExamId: { in: mockExamIds },
                subjectAreaName: subject,
            },
            select: {
                mockExamId: true,
                questionNumber: true,
                difficulty: true,
            },
        });
        const diffMap = new Map<string, string>();
        for (const eq of examQuestions) {
            if (eq.difficulty)
                diffMap.set(`${eq.mockExamId}-${eq.questionNumber}`, eq.difficulty);
        }
        for (const ea of enrichedAnswers) {
            ea.difficulty =
                diffMap.get(`${ea.mockExamId}-${ea.questionNumber}`) || null;
        }

        // 4. 차원별 집계 함수
        const aggregate = (
            keyFn: (a: (typeof enrichedAnswers)[0]) => string | null,
        ): DimensionStat[] => {
            const groups = new Map<
                string,
                { total: number; wrong: number }
            >();
            for (const a of enrichedAnswers) {
                const key = keyFn(a) || '미분류';
                const g = groups.get(key) || { total: 0, wrong: 0 };
                g.total++;
                if (!a.isCorrect) g.wrong++;
                groups.set(key, g);
            }
            return Array.from(groups.entries())
                .map(([label, g]) => ({
                    label,
                    totalCount: g.total,
                    wrongCount: g.wrong,
                    wrongRate: g.total > 0 ? Math.round((g.wrong / g.total) * 100) : 0,
                }))
                .sort((a, b) => b.wrongRate - a.wrongRate);
        };

        const totalWrong = enrichedAnswers.filter((a) => !a.isCorrect).length;

        return {
            subject,
            totalCount: enrichedAnswers.length,
            wrongCount: totalWrong,
            wrongRate:
                enrichedAnswers.length > 0
                    ? Math.round((totalWrong / enrichedAnswers.length) * 100)
                    : 0,
            bySubSubject: aggregate((a) => a.subSubject),
            byDifficulty: aggregate((a) => a.difficulty),
            byQuestionType: aggregate((a) => a.questionType),
            byQuestionForm: aggregate((a) => a.questionForm),
            byMajorChapter: aggregate((a) => a.majorChapter),
            byScore: aggregate((a) =>
                a.categoryScore != null ? `${a.categoryScore}점` : null,
            ),
        };
    }
}
