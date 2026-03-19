import { Module } from '@nestjs/common';
import { WrongAnswerController } from './wrong-answer.controller';
import { WrongAnswerService } from './wrong-answer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WrongAnswerController],
  providers: [WrongAnswerService],
  exports: [WrongAnswerService],
})
export class WrongAnswerModule {}
