import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { MyClassService } from './my-class.service';
import { CreateGroupStudyDto, JoinGroupStudyDto } from './dto/my-class.dto';
import {
  AuthHeader,
  HubClientService,
  HubGroup,
} from '../hub-client';
import { JwtPayloadType } from '../auth/types/jwt-payload.type';

/**
 * 그룹 스터디는 Hub `/api/groups/*`로 위임됨.
 * 응답 shape은 프론트엔드 호환을 위해 기존 GroupStudy 형식으로 매핑.
 * Hub 응답이 camelCase / snake_case 어느 쪽이든 받아들임.
 */
function mapHubGroupToLegacy(g: any): {
  id: number;
  classCode: string;
  name: string;
  description?: string;
  maxMembers: number;
  memberCount: number;
  myRole: string;
} {
  return {
    id: g.id,
    classCode: g.inviteCode ?? g.invite_code ?? g.classCode ?? '',
    name: g.name,
    description: g.description ?? undefined,
    maxMembers: g.maxMembers ?? g.max_members ?? 0,
    memberCount: g.memberCount ?? g.member_count ?? 0,
    myRole: g.myRole ?? g.my_role ?? g.role ?? 'member',
  };
}

@ApiTags('마이클래스')
@Controller('api/my-class')
export class MyClassController {
  constructor(
    private readonly service: MyClassService,
    private readonly hub: HubClientService,
  ) {}

  // ── 목표대학 반 ──────────────────────────────────────────────
  // (점수 랭킹은 Mogo 단독. 학생 자동 편입은 target.service의 matchTargetUniv 훅에서.)

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

  // ── 그룹 스터디 (Hub 위임) ──────────────────────────────────

  @Get('group-study')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 그룹 스터디 목록 (Hub 위임)' })
  async getMyGroupStudies(@AuthHeader() authHeader: string) {
    const groups = await this.hub.getMyGroups(authHeader);
    return { success: true, data: groups.map(mapHubGroupToLegacy) };
  }

  @Post('group-study')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '그룹 스터디 생성 (Hub 위임)' })
  async createGroupStudy(
    @AuthHeader() authHeader: string,
    @Body() dto: CreateGroupStudyDto,
  ) {
    // Mogo 학생이 만드는 그룹은 학생끼리(student_study)가 기본.
    // 멘토 클래스는 Planner에서 생성.
    const group = await this.hub.createGroup(authHeader, {
      groupType: 'student_study',
      name: dto.name,
      grade: dto.grade,
    });
    return { success: true, data: mapHubGroupToLegacy(group) };
  }

  @Post('group-study/join')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '코드로 그룹 스터디 참여 (Hub 위임)' })
  async joinGroupStudy(
    @AuthHeader() authHeader: string,
    @Body() dto: JoinGroupStudyDto,
  ) {
    const group = await this.hub.joinGroup(authHeader, { inviteCode: dto.classCode });
    return { success: true, data: mapHubGroupToLegacy(group) };
  }

  @Delete('group-study/:classId/leave')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '그룹 스터디 탈퇴 (Hub 위임, owner면 Hub이 그룹 삭제 처리)' })
  async leaveGroupStudy(
    @AuthHeader() authHeader: string,
    @Param('classId', ParseIntPipe) classId: number,
  ) {
    await this.hub.leaveGroup(authHeader, classId);
    return { success: true };
  }

  // ── 그룹 스터디 - 랭킹/추이 (Task #3에서 Hub members 기반으로 재구성) ──

  @Get('group-study/:classId/ranking')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '그룹 스터디 - 멤버 랭킹' })
  async getGroupStudyRanking(
    @Param('classId', ParseIntPipe) classId: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayloadType;
    const data = await this.service.getGroupStudyRanking(user.sub, classId);
    return { success: true, data };
  }

  @Get('group-study/:classId/trend')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '그룹 스터디 - 멤버별 성적 추이' })
  async getGroupStudyTrend(
    @Param('classId', ParseIntPipe) classId: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayloadType;
    const data = await this.service.getGroupStudyTrend(user.sub, classId);
    return { success: true, data };
  }
}
