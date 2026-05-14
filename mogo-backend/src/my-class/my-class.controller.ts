import { Controller, Get, Post, Delete, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MyClassService } from './my-class.service';
import { CreateGroupStudyDto, JoinGroupStudyDto } from './dto/my-class.dto';

@ApiTags('마이클래스')
@Controller('api/my-class')
export class MyClassController {
  constructor(private readonly service: MyClassService) {}

  // ── 목표대학 반 ──────────────────────────────────────────────

  @Get('target-class/:departmentCode/ranking')
  @ApiOperation({ summary: '목표대학 반 - 익명 랭킹' })
  async getTargetClassRanking(
    @Param('departmentCode') departmentCode: string,
    @Query('memberId') memberId: string,
    @Query('examId') examId?: string,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.getTargetClassRanking(
      departmentCode,
      numericId,
      examId ? parseInt(examId) : undefined,
    );
    return { success: true, data };
  }

  @Get('target-class/:departmentCode/trend')
  @ApiOperation({ summary: '목표대학 반 - 성적 추이 밴드 + 내 추이' })
  async getTargetClassTrend(
    @Param('departmentCode') departmentCode: string,
    @Query('memberId') memberId: string,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.getTargetClassTrend(departmentCode, numericId);
    return { success: true, data };
  }

  // ── 그룹 스터디 ──────────────────────────────────────────────

  @Get('group-study')
  @ApiOperation({ summary: '내 그룹 스터디 목록' })
  async getMyGroupStudies(@Query('memberId') memberId: string) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.getMyGroupStudies(numericId);
    return { success: true, data };
  }

  @Post('group-study')
  @ApiOperation({ summary: '그룹 스터디 생성' })
  async createGroupStudy(
    @Query('memberId') memberId: string,
    @Body() dto: CreateGroupStudyDto,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.createGroupStudy(numericId, dto);
    return { success: true, data };
  }

  @Post('group-study/join')
  @ApiOperation({ summary: '코드로 그룹 스터디 참여' })
  async joinGroupStudy(
    @Query('memberId') memberId: string,
    @Body() dto: JoinGroupStudyDto,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.joinGroupStudy(numericId, dto);
    return { success: true, data };
  }

  @Delete('group-study/:classId/leave')
  @ApiOperation({ summary: '그룹 스터디 탈퇴 (개설자는 삭제)' })
  async leaveGroupStudy(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('memberId') memberId: string,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.leaveGroupStudy(numericId, classId);
    return { success: true, data };
  }

  @Get('group-study/:classId/ranking')
  @ApiOperation({ summary: '그룹 스터디 - 멤버 랭킹' })
  async getGroupStudyRanking(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('memberId') memberId: string,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.getGroupStudyRanking(numericId, classId);
    return { success: true, data };
  }

  @Get('group-study/:classId/trend')
  @ApiOperation({ summary: '그룹 스터디 - 멤버별 성적 추이' })
  async getGroupStudyTrend(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('memberId') memberId: string,
  ) {
    const numericId = await this.service.resolveNumericMemberId(memberId);
    const data = await this.service.getGroupStudyTrend(numericId, classId);
    return { success: true, data };
  }
}
