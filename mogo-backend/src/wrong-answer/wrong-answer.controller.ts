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
import { WrongAnswerService } from './wrong-answer.service';
import {
  WrongAnswerGradeDto,
  FilterWrongAnswerDto,
  UpdateWrongReasonDto,
} from './dto/wrong-answer-request.dto';
import {
  GradeResultResponseDto,
  WrongAnswerListResponseDto,
  WrongAnswerSummaryDto,
  WrongAnswerByExamResponseDto,
  StudentAnswerDto,
} from './dto/wrong-answer-response.dto';

@ApiTags('오답노트')
@Controller('api/wrong-answers')
export class WrongAnswerController {
  constructor(private readonly wrongAnswerService: WrongAnswerService) { }

  @Post('grade')
  @ApiOperation({ summary: '답안 채점', description: '학생 답안을 채점하고 저장합니다.' })
  @ApiResponse({ status: 201, description: '채점 결과', type: GradeResultResponseDto })
  async gradeAnswers(@Body() gradeAnswersDto: WrongAnswerGradeDto) {
    const data = await this.wrongAnswerService.gradeAnswers(gradeAnswersDto);
    return { success: true, data };
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: '오답 목록 조회', description: '학생의 오답 목록을 필터링하여 조회합니다.' })
  @ApiResponse({ status: 200, description: '오답 목록', type: WrongAnswerListResponseDto })
  async findWrongAnswers(
    @Param('studentId') memberId: string,
    @Query() filter: FilterWrongAnswerDto,
  ) {
    const data = await this.wrongAnswerService.findWrongAnswers(memberId, filter);
    return { success: true, data };
  }

  @Get('student/:studentId/summary')
  @ApiOperation({ summary: '오답 요약 통계', description: '학생의 오답 요약 통계를 조회합니다.' })
  @ApiResponse({ status: 200, description: '오답 요약', type: WrongAnswerSummaryDto })
  async getSummary(@Param('studentId') memberId: string) {
    const data = await this.wrongAnswerService.getSummary(memberId);
    return { success: true, data };
  }

  @Get('student/:studentId/by-exam')
  @ApiOperation({ summary: '모의고사별 오답 현황', description: '학생의 모의고사별 오답 현황을 조회합니다.' })
  @ApiResponse({ status: 200, description: '모의고사별 오답 현황', type: WrongAnswerByExamResponseDto })
  async getByExam(@Param('studentId') studentId: string) {
    const data = await this.wrongAnswerService.getByExam(studentId);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: '개별 답안 조회' })
  @ApiResponse({ status: 200, description: '답안 상세', type: StudentAnswerDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.wrongAnswerService.findOne(id);
    return { success: true, data };
  }

  @Put(':id/reason')
  @ApiOperation({ summary: '오답 이유 업데이트', description: '오답에 대한 메모/이유를 업데이트합니다.' })
  @ApiResponse({ status: 200, description: '업데이트된 답안', type: StudentAnswerDto })
  async updateWrongReason(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWrongReasonDto,
  ) {
    const data = await this.wrongAnswerService.updateWrongReason(id, dto);
    return { success: true, data };
  }

  @Put(':id/bookmark')
  @ApiOperation({ summary: '북마크 토글', description: '답안의 북마크 상태를 토글합니다.' })
  @ApiResponse({ status: 200, description: '업데이트된 답안', type: StudentAnswerDto })
  async toggleBookmark(@Param('id', ParseIntPipe) id: number) {
    const data = await this.wrongAnswerService.toggleBookmark(id);
    return { success: true, data };
  }

  @Put(':id/review')
  @ApiOperation({ summary: '복습 기록', description: '복습 횟수를 1 증가시키고 복습 일시를 기록합니다.' })
  @ApiResponse({ status: 200, description: '업데이트된 답안', type: StudentAnswerDto })
  async recordReview(@Param('id', ParseIntPipe) id: number) {
    const data = await this.wrongAnswerService.recordReview(id);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: '답안 삭제' })
  @ApiResponse({ status: 200, description: '삭제 완료' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.wrongAnswerService.remove(id);
    return { success: true, message: '답안이 삭제되었습니다.' };
  }

  @Delete('student/:studentId/exam/:mockExamId')
  @ApiOperation({ summary: '모의고사별 답안 전체 삭제', description: '특정 모의고사의 모든 답안을 삭제합니다.' })
  @ApiResponse({ status: 200, description: '삭제 완료' })
  async removeByExam(
    @Param('studentId') studentId: string,
    @Param('mockExamId', ParseIntPipe) mockExamId: number,
  ) {
    const result = await this.wrongAnswerService.removeByExam(studentId, mockExamId);
    return {
      success: true,
      message: `${result.count}개의 답안이 삭제되었습니다.`,
      deletedCount: result.count,
    };
  }
}
