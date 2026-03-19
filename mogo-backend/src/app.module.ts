import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MockExamModule } from './mock-exam/mock-exam.module';
import { ScoreModule } from './score/score.module';
import { UniversityModule } from './university/university.module';
import { AnalysisModule } from './analysis/analysis.module';
import { StatisticsModule } from './statistics/statistics.module';
import { TargetModule } from './target/target.module';
import { AdminModule } from './admin/admin.module';
import { WrongAnswerModule } from './wrong-answer/wrong-answer.module';
import { WeaknessAnalysisModule } from './weakness-analysis/weakness-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),
    AuthModule,
    PrismaModule,
    MockExamModule,
    ScoreModule,
    UniversityModule,
    AnalysisModule,
    StatisticsModule,
    TargetModule,
    AdminModule,
    WrongAnswerModule,
    WeaknessAnalysisModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
