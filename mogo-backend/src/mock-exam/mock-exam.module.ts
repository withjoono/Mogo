import { Module } from '@nestjs/common';
import { MockExamController } from './mock-exam.controller';
import { MockExamService } from './mock-exam.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MockExamController],
  providers: [MockExamService],
  exports: [MockExamService],
})
export class MockExamModule {}










