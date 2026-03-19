import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { HubPermissionGuard } from '../auth/guards/hub-permission.guard';
import { RequireFeature } from '../auth/decorators/require-feature.decorator';
import { MockExamService } from './mock-exam.service';
import { SearchMockExamDto } from './dto/search-mock-exam.dto';
import { MockExamResponseDto } from './dto/mock-exam-response.dto';
import { GradeAnswersDto, GradeResultDto } from './dto/grade-answers.dto';

@ApiTags('모의고사')
@Controller('api/mock-exams')
export class MockExamController {
  constructor(private readonly mockExamService: MockExamService) { }

  @Get()
  @ApiOperation({ summary: '모의고사 목록 조회' })
  @ApiResponse({ status: 200, description: '모의고사 목록', type: [MockExamResponseDto] })
  async findAll() {
    const data = await this.mockExamService.findAll();
    return { success: true, data };
  }

  @Get('search')
  @ApiOperation({ summary: '모의고사 검색 (연도/학년/월)' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: '연도 (예: 2024)' })
  @ApiQuery({ name: 'grade', required: false, type: String, description: '학년 (H1, H2, H3)' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: '시행 월 (3, 6, 9, 11 등)' })
  @ApiResponse({ status: 200, description: '검색 결과', type: [MockExamResponseDto] })
  async search(@Query() searchDto: SearchMockExamDto) {
    const data = await this.mockExamService.search(searchDto);
    return { success: true, data };
  }

  @Get('check')
  @ApiOperation({ summary: '모의고사 존재 여부 확인' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'grade', required: true, type: String })
  @ApiQuery({ name: 'month', required: true, type: Number })
  async checkExists(
    @Query('year', ParseIntPipe) year: number,
    @Query('grade') grade: string,
    @Query('month', ParseIntPipe) month: number,
  ) {
    const data = await this.mockExamService.checkExists(year, grade, month);
    return { success: true, data };
  }

  @Get('kyokwa-subjects')
  @ApiOperation({ summary: '교과/과목 목록 조회 (hub 공유 테이블)' })
  @ApiQuery({ name: 'curriculum', required: false, type: String, description: '교육과정 (2015 | 2022, 기본: 2015)' })
  async getKyokwaSubjects(@Query('curriculum') curriculum?: string) {
    const cur = curriculum === '2022' ? '2022' : '2015';
    const data = await this.mockExamService.getKyokwaSubjects(cur);
    return { success: true, data };
  }

  @Get(':id/answers')
  @ApiOperation({ summary: '모의고사 정답 조회 (과목별)' })
  @ApiQuery({ name: 'subject', required: true, type: String, description: '과목명 (국어, 수학, 영어 등)' })
  @ApiQuery({ name: 'subjectDetail', required: false, type: String, description: '세부 과목명 (화법과작문 등)' })
  async getAnswers(
    @Param('id', ParseIntPipe) id: number,
    @Query('subject') subject: string,
    @Query('subjectDetail') subjectDetail?: string,
  ) {
    const data = await this.mockExamService.getAnswers(id, subject, subjectDetail);
    return { success: true, data };
  }

  @Post('grade')
  @ApiOperation({ summary: '채점하기 - 학생 답안과 정답 비교' })
  @ApiBody({ type: GradeAnswersDto })
  @ApiResponse({ status: 200, description: '채점 결과', type: GradeResultDto })
  async gradeAnswers(@Body() gradeDto: GradeAnswersDto) {
    const data = await this.mockExamService.gradeAnswers(gradeDto);
    return { success: true, data };
  }

  @Get('code/:code')
  @ApiOperation({ summary: '모의고사 코드로 조회' })
  @ApiResponse({ status: 200, description: '모의고사 상세', type: MockExamResponseDto })
  async findByCode(@Param('code') code: string) {
    const data = await this.mockExamService.findByCode(code);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: '모의고사 ID로 조회' })
  @ApiResponse({ status: 200, description: '모의고사 상세', type: MockExamResponseDto })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.mockExamService.findById(id);
    return { success: true, data };
  }

  // ========== SSO 권한 테스트 엔드포인트 ==========

  @Get('test/basic')
  @ApiOperation({ summary: '[권한 테스트] 기본 점수 조회 - 권한 불필요' })
  @ApiResponse({ status: 200, description: '무료 사용자도 접근 가능' })
  async testBasic() {
    return {
      success: true,
      message: '기본 점수 조회 - 무료 (권한 체크 없음)',
      data: {
        feature: 'basic',
        requiredPermission: 'none',
      },
    };
  }

  @Get('test/detailed')
  @UseGuards(AuthGuard('jwt'), HubPermissionGuard)
  @RequireFeature('mock-exam')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[권한 테스트] 상세 모의고사 - mock-exam 권한 필요' })
  @ApiResponse({ status: 200, description: 'mock-exam 권한이 있으면 접근 가능' })
  @ApiResponse({ status: 403, description: '권한이 없거나 구독이 만료됨' })
  async testDetailed() {
    return {
      success: true,
      message: '상세 모의고사 분석 - basic 이상 플랜 필요',
      data: {
        feature: 'detailed',
        requiredPermission: 'mock-exam',
      },
    };
  }

  @Get('test/analysis')
  @UseGuards(AuthGuard('jwt'), HubPermissionGuard)
  @RequireFeature('analysis')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[권한 테스트] 심화 분석 - analysis 권한 필요' })
  @ApiResponse({ status: 200, description: 'analysis 권한이 있으면 접근 가능' })
  @ApiResponse({ status: 403, description: '권한이 없거나 구독이 만료됨' })
  async testAnalysis() {
    return {
      success: true,
      message: '심화 분석 - premium 플랜 필요',
      data: {
        feature: 'analysis',
        requiredPermission: 'analysis',
      },
    };
  }

  @Get('test/statistics')
  @UseGuards(AuthGuard('jwt'), HubPermissionGuard)
  @RequireFeature('statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[권한 테스트] 통계 분석 - statistics 권한 필요' })
  @ApiResponse({ status: 200, description: 'statistics 권한이 있으면 접근 가능' })
  @ApiResponse({ status: 403, description: '권한이 없거나 구독이 만료됨' })
  async testStatistics() {
    return {
      success: true,
      message: '통계 분석 - premium 플랜 필요',
      data: {
        feature: 'statistics',
        requiredPermission: 'statistics',
      },
    };
  }
}

