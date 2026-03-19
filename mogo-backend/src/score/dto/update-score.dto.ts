import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateScoreDto } from './create-score.dto';

export class UpdateScoreDto extends PartialType(
  OmitType(CreateScoreDto, ['studentId', 'mockExamId'] as const),
) {}










