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
}
