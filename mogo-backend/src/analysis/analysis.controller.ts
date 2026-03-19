import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import {
  ScoreSummaryDto,
  ReflectionAnalysisDto,
  CombinationAnalysisDto,
  AchievementAnalysisDto,
} from './dto/analysis-response.dto';
import {
  ReflectionAnalysisRequestDto,
  CombinationAnalysisRequestDto,
} from './dto/analysis-request.dto';

@ApiTags('성적 분석')
@Controller('api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('summary/:scoreId')
  @ApiOperation({ summary: '성적 요약 조회' })
  @ApiResponse({
    status: 200,
    description: '성적 요약 정보',
    type: ScoreSummaryDto,
  })
  async getSummary(@Param('scoreId', ParseIntPipe) scoreId: number) {
    const data = await this.analysisService.getSummary(scoreId);
    return { success: true, data };
  }

  @Get('reflection/:scoreId')
  @ApiOperation({ summary: '반영비율 분석 - 대학별 환산점수 비교' })
  @ApiQuery({
    name: 'departmentIds',
    required: false,
    type: String,
    description: '분석할 학과 ID 목록 (콤마 구분, 미입력시 샘플 대학)',
  })
  @ApiResponse({
    status: 200,
    description: '반영비율 분석 결과',
    type: ReflectionAnalysisDto,
  })
  async getReflectionAnalysis(
    @Param('scoreId', ParseIntPipe) scoreId: number,
    @Query('departmentIds') departmentIdsStr?: string,
  ) {
    const params: ReflectionAnalysisRequestDto = {};

    if (departmentIdsStr) {
      params.departmentIds = departmentIdsStr
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
    }

    const data = await this.analysisService.getReflectionAnalysis(scoreId, params);
    return { success: true, data };
  }

  @Get('combination/:scoreId')
  @ApiOperation({ summary: '조합별 분석 - 국수탐, 국영탐 등 조합별 점수' })
  @ApiQuery({
    name: 'combinations',
    required: false,
    type: String,
    description: '분석할 조합 목록 (콤마 구분, 예: 국수탐,국영탐)',
  })
  @ApiResponse({
    status: 200,
    description: '조합별 분석 결과',
    type: CombinationAnalysisDto,
  })
  async getCombinationAnalysis(
    @Param('scoreId', ParseIntPipe) scoreId: number,
    @Query('combinations') combinationsStr?: string,
  ) {
    const params: CombinationAnalysisRequestDto = {};

    if (combinationsStr) {
      params.combinations = combinationsStr
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
    }

    const data = await this.analysisService.getCombinationAnalysis(scoreId, params);
    return { success: true, data };
  }

  @Get('achievement/:scoreId')
  @ApiOperation({ summary: '성취수준 분석 - 과목별 등급 및 전체 평가' })
  @ApiResponse({
    status: 200,
    description: '성취수준 분석 결과',
    type: AchievementAnalysisDto,
  })
  async getAchievementAnalysis(
    @Param('scoreId', ParseIntPipe) scoreId: number,
  ) {
    const data = await this.analysisService.getAchievementAnalysis(scoreId);
    return { success: true, data };
  }
}
