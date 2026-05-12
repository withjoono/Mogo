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
    @Query('memberId', ParseIntPipe) memberId: number,
    @Query('examId') examId?: string,
  ) {
    const data = await this.service.getTargetClassRanking(
      departmentCode,
      memberId,
      examId ? parseInt(examId) : undefined,
    );
    return { success: true, data };
  }

  @Get('target-class/:departmentCode/trend')
  @ApiOperation({ summary: '목표대학 반 - 성적 추이 밴드 + 내 추이' })
  async getTargetClassTrend(
    @Param('departmentCode') departmentCode: string,
    @Query('memberId', ParseIntPipe) memberId: number,
  ) {
    const data = await this.service.getTargetClassTrend(departmentCode, memberId);
    return { success: true, data };
  }

  // ── 그룹 스터디 ──────────────────────────────────────────────

  @Get('group-study')
  @ApiOperation({ summary: '내 그룹 스터디 목록' })
  async getMyGroupStudies(@Query('memberId', ParseIntPipe) memberId: number) {
    const data = await this.service.getMyGroupStudies(memberId);
    return { success: true, data };
  }

  @Post('group-study')
  @ApiOperation({ summary: '그룹 스터디 생성' })
  async createGroupStudy(
    @Query('memberId', ParseIntPipe) memberId: number,
    @Body() dto: CreateGroupStudyDto,
  ) {
    const data = await this.service.createGroupStudy(memberId, dto);
    return { success: true, data };
  }

  @Post('group-study/join')
  @ApiOperation({ summary: '코드로 그룹 스터디 참여' })
  async joinGroupStudy(
    @Query('memberId', ParseIntPipe) memberId: number,
    @Body() dto: JoinGroupStudyDto,
  ) {
    const data = await this.service.joinGroupStudy(memberId, dto);
    return { success: true, data };
  }

  @Delete('group-study/:classId/leave')
  @ApiOperation({ summary: '그룹 스터디 탈퇴 (개설자는 삭제)' })
  async leaveGroupStudy(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('memberId', ParseIntPipe) memberId: number,
  ) {
    const data = await this.service.leaveGroupStudy(memberId, classId);
    return { success: true, data };
  }

  @Get('group-study/:classId/ranking')
  @ApiOperation({ summary: '그룹 스터디 - 멤버 랭킹' })
  async getGroupStudyRanking(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('memberId', ParseIntPipe) memberId: number,
  ) {
    const data = await this.service.getGroupStudyRanking(memberId, classId);
    return { success: true, data };
  }

  @Get('group-study/:classId/trend')
  @ApiOperation({ summary: '그룹 스터디 - 멤버별 성적 추이' })
  async getGroupStudyTrend(
    @Param('classId', ParseIntPipe) classId: number,
    @Query('memberId', ParseIntPipe) memberId: number,
  ) {
    const data = await this.service.getGroupStudyTrend(memberId, classId);
    return { success: true, data };
  }
}
