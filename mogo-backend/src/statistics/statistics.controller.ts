import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  TrendAnalysisDto,
  CumulativeAnalysisDto,
  SubjectAnalysisResponseDto,
} from './dto/statistics-response.dto';

@ApiTags('누적 분석')
@Controller('api/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) { }

  @Get('trend/:studentId')
  @ApiOperation({ summary: '성적 추이 조회 - 시험별 성적 변화' })
  @ApiQuery({ name: 'startYear', required: false, type: Number, description: '시작 연도' })
  @ApiQuery({ name: 'endYear', required: false, type: Number, description: '종료 연도' })
  @ApiQuery({ name: 'subject', required: false, type: String, description: '특정 과목 (국어, 수학 등)' })
  @ApiQuery({ name: 'grade', required: false, type: String, description: '학년 (H1, H2, H3)' })
  @ApiResponse({
    status: 200,
    description: '성적 추이 분석 결과',
    type: TrendAnalysisDto,
  })
  async getTrend(
    @Param('studentId') studentId: string,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
    @Query('subject') subject?: string,
    @Query('grade') grade?: string,
  ) {
    const params = {
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
      subject,
      grade,
    };
    const data = await this.statisticsService.getTrend(studentId, params);
    return { success: true, data };
  }

  @Get('cumulative/:studentId')
  @ApiOperation({ summary: '누적 분석 - 전체 시험 통계' })
  @ApiQuery({ name: 'startYear', required: false, type: Number, description: '시작 연도' })
  @ApiQuery({ name: 'endYear', required: false, type: Number, description: '종료 연도' })
  @ApiResponse({
    status: 200,
    description: '누적 분석 결과',
    type: CumulativeAnalysisDto,
  })
  async getCumulative(
    @Param('studentId') studentId: string,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
  ) {
    const params = {
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
    };
    const data = await this.statisticsService.getCumulative(studentId, params);
    return { success: true, data };
  }

  @Get('by-subject/:studentId')
  @ApiOperation({ summary: '과목별 상세 분석' })
  @ApiQuery({ name: 'subject', required: false, type: String, description: '특정 과목 (국어, 수학, 영어 등)' })
  @ApiQuery({ name: 'startYear', required: false, type: Number, description: '시작 연도' })
  @ApiQuery({ name: 'endYear', required: false, type: Number, description: '종료 연도' })
  @ApiResponse({
    status: 200,
    description: '과목별 상세 분석 결과',
    type: SubjectAnalysisResponseDto,
  })
  async getBySubject(
    @Param('studentId') studentId: string,
    @Query('subject') subject?: string,
    @Query('startYear') startYear?: string,
    @Query('endYear') endYear?: string,
  ) {
    const params = {
      subject,
      startYear: startYear ? parseInt(startYear, 10) : undefined,
      endYear: endYear ? parseInt(endYear, 10) : undefined,
    };
    const data = await this.statisticsService.getBySubject(studentId, params);
    return { success: true, data };
  }
}
