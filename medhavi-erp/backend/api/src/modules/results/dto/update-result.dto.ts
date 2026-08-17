import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateResultDto } from './create-result.dto';

export class UpdateResultDto extends PartialType(
  OmitType(CreateResultDto, ['instituteId', 'examId', 'subjectOfferingId', 'studentId'] as const),
) {}
