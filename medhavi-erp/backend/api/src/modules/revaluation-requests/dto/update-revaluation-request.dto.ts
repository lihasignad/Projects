import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRevaluationRequestDto } from './create-revaluation-request.dto';

export class UpdateRevaluationRequestDto extends PartialType(
  OmitType(CreateRevaluationRequestDto, ['instituteId', 'examId', 'resultId', 'studentId'] as const),
) {}
