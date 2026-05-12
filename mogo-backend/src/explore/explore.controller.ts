import { Controller, Get, Post, Query, Param, Req, Headers } from '@nestjs/common';
import { ExploreService } from './explore.service';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Controller('explore')
export class ExploreController {
  constructor(
    private readonly exploreService: ExploreService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('regular')
  async getRegularAdmissions(
    @Query('year') year: string,
    @Query('admission_type') admissionType?: string,
  ) {
    const items = await this.exploreService.getAdmissions(year, admissionType);
    return { items };
  }

  @Get('regular/:id')
  async getRegularAdmissionDetail(@Param('id') id: string) {
    const data = await this.exploreService.getAdmissionDetail(Number(id));
    return { success: true, data };
  }

  /** 현재 로그인 학생의 최신 표준점수 합산 + 영어/한국사 등급 조회 */
  @Get('my-scores')
  async getMyScores(@Headers('authorization') auth: string) {
    try {
      if (!auth) return { success: false, data: null };
      const token = auth.replace('Bearer ', '');
      const secret = process.env.AUTH_SECRET || '';
      const payload: any = jwt.verify(token, secret);
      const hubMemberId: string = String(payload.sub || payload.id || '');
      if (!hubMemberId) return { success: false, data: null };

      const member = await this.prisma.member.findUnique({
        where: { memberId: `mogo_${hubMemberId}` },
      });
      if (!member) return { success: false, data: null };

      const scores = await this.prisma.studentScore.findMany({
        where: { memberId: member.id },
        include: { mockExam: true },
      });
      scores.sort((a: any, b: any) => {
        const yearDiff = (b.mockExam?.year ?? 0) - (a.mockExam?.year ?? 0);
        if (yearDiff !== 0) return yearDiff;
        return (b.mockExam?.month ?? 0) - (a.mockExam?.month ?? 0);
      });

      const latest = scores[0];
      if (!latest) return { success: true, data: null };

      return {
        success: true,
        data: {
          standardScoreSum: latest.totalStandardSum ?? 0,
          englishGrade: latest.englishGrade ?? 9,
          historyGrade: latest.historyGrade ?? 9,
          koreanStandard: latest.koreanStandard,
          mathStandard: latest.mathStandard,
          inquiry1Standard: latest.inquiry1Standard,
          inquiry2Standard: latest.inquiry2Standard,
          mockExamId: latest.mockExamId,
          mockExamName: latest.mockExam ? `${latest.mockExam.year}년 ${latest.mockExam.month}월 모의고사` : '',
        },
      };
    } catch (e) {
      return { success: false, data: null };
    }
  }

  // Jungsi compatibility endpoints
  @Post('../jungsi/calculate')
  async calculateScores() {
    return { success: true, data: { calculated: 1, saved: 1 } };
  }

  @Get('../jungsi/scores')
  async getSavedScores(@Req() req: any) {
    // For mock/mogo, we just return empty or let it be handled
    return { success: true, data: [] };
  }

  @Get('../members/:memberId/regular-interests')
  async getInterests() {
    return { success: true, data: [] };
  }
}
