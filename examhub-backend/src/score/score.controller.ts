import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { ScoreResponseDto } from './dto/score-response.dto';

@ApiTags('점수')
@Controller('api/scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) { }

  @Post()
  @ApiOperation({ summary: '점수 저장 (원점수/표준점수)' })
  @ApiResponse({ status: 201, description: '저장된 점수', type: ScoreResponseDto })
  async create(@Body() createScoreDto: CreateScoreDto) {
    const data = await this.scoreService.create(createScoreDto);
    return { success: true, data };
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: '학생의 모든 점수 조회' })
  @ApiResponse({ status: 200, description: '점수 목록', type: [ScoreResponseDto] })
  async findByStudent(@Param('studentId') studentId: string) {
    const data = await this.scoreService.findByStudent(studentId);
    return { success: true, data };
  }

  @Get('student/:studentId/latest')
  @ApiOperation({ summary: '학생의 최근 점수 조회' })
  @ApiResponse({ status: 200, description: '최근 점수', type: ScoreResponseDto })
  async findLatestByStudent(@Param('studentId') studentId: string) {
    const data = await this.scoreService.findLatestByStudent(studentId);
    return { success: true, data };
  }

  @Get('student/:studentId/exam/:mockExamId')
  @ApiOperation({ summary: '특정 학생의 특정 모의고사 점수 조회' })
  @ApiResponse({ status: 200, description: '점수 상세', type: ScoreResponseDto })
  async findOne(
    @Param('studentId') studentId: string,
    @Param('mockExamId', ParseIntPipe) mockExamId: number,
  ) {
    const data = await this.scoreService.findOne(studentId, mockExamId);
    return { success: true, data };
  }

  @Get('conversion/standard/:mockExamId')
  @ApiOperation({ summary: '표준점수 변환표 조회' })
  @ApiQuery({ name: 'subject', required: true, description: '과목명 (국어, 수학 등)' })
  async getScoreConversion(
    @Param('mockExamId', ParseIntPipe) mockExamId: number,
    @Query('subject') subject: string,
  ) {
    const data = await this.scoreService.getScoreConversion(mockExamId, subject);
    return { success: true, data };
  }

  @Get('conversion/raw/:mockExamId')
  @ApiOperation({ summary: '원점수 변환표 조회' })
  @ApiQuery({ name: 'subject', required: true, description: '과목명' })
  @ApiQuery({ name: 'subjectType', required: false, description: '선택과목 (화작, 언매 등)' })
  async getRawScoreConversion(
    @Param('mockExamId', ParseIntPipe) mockExamId: number,
    @Query('subject') subject: string,
    @Query('subjectType') subjectType?: string,
  ) {
    const data = await this.scoreService.getRawScoreConversion(mockExamId, subject, subjectType);
    return { success: true, data };
  }

  @Get('cumulative-top-pct/:mockExamId')
  @ApiOperation({ summary: '상위누적백분위 조회' })
  @ApiQuery({ name: 'standardSum', required: true, description: '국수탐 표점합' })
  @ApiQuery({ name: 'englishGrade', required: true, description: '영어등급 (1~9)' })
  async getCumulativeTopPct(
    @Param('mockExamId', ParseIntPipe) mockExamId: number,
    @Query('standardSum', ParseIntPipe) standardSum: number,
    @Query('englishGrade', ParseIntPipe) englishGrade: number,
  ) {
    const data = await this.scoreService.getCumulativeTopPct(mockExamId, standardSum, englishGrade);
    return { success: true, data };
  }

  @Post('convert/:studentId/:mockExamId')
  @ApiOperation({ summary: '성적 자동 변환 (표점→백분위/등급→상위누백)' })
  async convertScores(
    @Param('studentId') studentId: string,
    @Param('mockExamId', ParseIntPipe) mockExamId: number,
  ) {
    // studentId → numeric memberId 변환
    const member = await this.scoreService.findOne(studentId, mockExamId);
    const data = await this.scoreService.calculateConvertedScores(member.memberId, mockExamId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: '점수 ID로 조회' })
  @ApiResponse({ status: 200, description: '점수 상세', type: ScoreResponseDto })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.scoreService.findById(id);
    return { success: true, data };
  }

  @Put(':id')
  @ApiOperation({ summary: '점수 수정' })
  @ApiResponse({ status: 200, description: '수정된 점수', type: ScoreResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    const data = await this.scoreService.update(id, updateScoreDto);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: '점수 삭제' })
  @ApiResponse({ status: 200, description: '삭제 완료' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.scoreService.remove(id);
    return { success: true, message: '점수가 삭제되었습니다.' };
  }
}










