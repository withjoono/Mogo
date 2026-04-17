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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { CreateQuestionDto, UploadQuestionsDto } from './dto/create-question.dto';
import { SubmitGradingDto } from './dto/submit-grading.dto';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // Mock Exam CRUD
  @Post('mock-exams')
  @ApiOperation({ summary: '시험 생성' })
  @ApiResponse({ status: 201, description: '시험이 생성되었습니다.' })
  async createMockExam(@Body() dto: CreateMockExamDto) {
    return this.adminService.createMockExam(dto);
  }

  @Put('mock-exams/:id')
  @ApiOperation({ summary: '시험 수정' })
  async updateMockExam(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateMockExamDto>,
  ) {
    return this.adminService.updateMockExam(id, dto);
  }

  @Delete('mock-exams/:id')
  @ApiOperation({ summary: '시험 삭제' })
  async deleteMockExam(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteMockExam(id);
  }

  // Questions Management
  @Post('mock-exams/:id/questions')
  @ApiOperation({ summary: '문제 일괄 등록' })
  async uploadQuestions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UploadQuestionsDto,
  ) {
    return this.adminService.uploadQuestions(id, dto.questions);
  }

  @Put('mock-exams/:id/questions/:questionNumber')
  @ApiOperation({ summary: '문제 수정' })
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Param('questionNumber', ParseIntPipe) questionNumber: number,
    @Query('subject') subject: string,
    @Body() dto: Partial<CreateQuestionDto>,
  ) {
    return this.adminService.updateQuestion(id, questionNumber, subject, dto);
  }

  @Delete('mock-exams/:id/questions/:questionNumber')
  @ApiOperation({ summary: '문제 삭제' })
  async deleteQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Param('questionNumber', ParseIntPipe) questionNumber: number,
    @Query('subject') subject: string,
  ) {
    return this.adminService.deleteQuestion(id, questionNumber, subject);
  }

  // Grading
  @Post('grading/submit')
  @ApiOperation({ summary: '학생 답안 제출 및 채점' })
  async submitGrading(@Body() dto: SubmitGradingDto) {
    return this.adminService.submitGrading(dto);
  }

  @Get('grading/exam/:examId')
  @ApiOperation({ summary: '시험별 채점 현황 조회' })
  async getGradingByExam(@Param('examId', ParseIntPipe) examId: number) {
    return this.adminService.getGradingByExam(examId);
  }

  @Get('grading/student/:studentId')
  @ApiOperation({ summary: '학생별 채점 결과 조회' })
  async getGradingByStudent(@Param('studentId') studentId: string) {
    return this.adminService.getGradingByStudent(studentId);
  }

  // Seed Status & Data Seeding
  @Get('seed-status')
  @ApiOperation({ summary: '시딩 현황 확인', description: 'mg_mock_answer, mg_exam_questions 데이터 현황을 확인합니다.' })
  async getSeedStatus() {
    return this.adminService.getSeedStatus();
  }

  @Post('seed-questions')
  @ApiOperation({
    summary: 'mg_mock_answer → mg_exam_questions 시딩',
    description: 'mg_mock_answer 테이블의 데이터를 읽어 mg_exam_questions에 삽입합니다. forceReseed=true이면 기존 데이터를 삭제 후 재시딩합니다.',
  })
  async seedQuestions(@Body() body: { forceReseed?: boolean }) {
    return this.adminService.seedExamQuestionsFromMockAnswer({
      forceReseed: body?.forceReseed ?? false,
    });
  }

  @Post('import-mock-answers')
  @ApiOperation({
    summary: 'mg_mock_answer 데이터 일괄 임포트',
    description: 'Mock Answer 데이터를 mg_mock_answer 테이블에 일괄 삽입합니다.',
  })
  async importMockAnswers(@Body() body: { rows: any[]; truncateFirst?: boolean }) {
    return this.adminService.importMockAnswers(body.rows, body.truncateFirst);
  }
}
