import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UniversityController],
  providers: [UniversityService],
  exports: [UniversityService],
})
export class UniversityModule {}










