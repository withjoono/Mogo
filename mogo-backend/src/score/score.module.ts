import { Module } from '@nestjs/common';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HubClientModule } from '../hub-client/hub-client.module';

@Module({
  imports: [PrismaModule, HubClientModule],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}










