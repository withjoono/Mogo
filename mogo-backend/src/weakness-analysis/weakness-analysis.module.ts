import { Module } from '@nestjs/common';
import { WeaknessAnalysisController } from './weakness-analysis.controller';
import { WeaknessAnalysisService } from './weakness-analysis.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [WeaknessAnalysisController],
    providers: [WeaknessAnalysisService],
    exports: [WeaknessAnalysisService],
})
export class WeaknessAnalysisModule { }
