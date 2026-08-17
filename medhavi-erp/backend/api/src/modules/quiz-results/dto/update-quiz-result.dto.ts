import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuizResultDto } from './create-quiz-result.dto';

export class UpdateQuizResultDto extends PartialType(
  OmitType(CreateQuizResultDto, ['instituteId', 'attemptId'] as const),
) {}
