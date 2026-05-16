import { Module } from '@nestjs/common';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HubClientModule } from '../hub-client';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, HubClientModule, AuthModule],
  controllers: [TargetController],
  providers: [TargetService],
  exports: [TargetService],
})
export class TargetModule {}
