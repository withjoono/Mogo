import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { MockExamService } from '../mock-exam/mock-exam.service';
import { ScoreService } from '../score/score.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, MockExamService, ScoreService],
})
export class AdminModule {}
