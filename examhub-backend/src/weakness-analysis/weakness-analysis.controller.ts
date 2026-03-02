import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WeaknessAnalysisService } from './weakness-analysis.service';

@ApiTags('취약분석')
@Controller('api/weakness-analysis')
export class WeaknessAnalysisController {
    constructor(
        private readonly weaknessService: WeaknessAnalysisService,
    ) { }

    @Get('student/:studentId/subjects')
    @ApiOperation({
        summary: '분석 가능 과목 조회',
        description: '학생이 답안 데이터를 보유한 과목 목록을 반환합니다.',
    })
    @ApiResponse({ status: 200, description: '과목 목록' })
    async getAvailableSubjects(@Param('studentId') studentId: string) {
        const subjects =
            await this.weaknessService.getAvailableSubjects(studentId);
        return { success: true, data: subjects };
    }

    @Get('student/:studentId/subject/:subject')
    @ApiOperation({
        summary: '과목별 취약점 분석',
        description:
            '특정 과목의 세부과목/난이도/유형/문제형태/단원/배점별 취약점을 분석합니다.',
    })
    @ApiResponse({ status: 200, description: '취약분석 결과' })
    async getWeaknessAnalysis(
        @Param('studentId') studentId: string,
        @Param('subject') subject: string,
    ) {
        const data = await this.weaknessService.getWeaknessAnalysis(
            studentId,
            subject,
        );
        return { success: true, data };
    }
}
