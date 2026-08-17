import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMarksEntryDto } from './create-marks-entry.dto';

export class UpdateMarksEntryDto extends PartialType(
  OmitType(CreateMarksEntryDto, ['instituteId', 'examId', 'subjectOfferingId'] as const),
) {}
