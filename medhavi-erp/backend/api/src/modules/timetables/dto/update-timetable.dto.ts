import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTimetableDto } from './create-timetable.dto';

export class UpdateTimetableDto extends PartialType(
  OmitType(CreateTimetableDto, ['instituteId', 'sectionId', 'termId'] as const),
) {}
