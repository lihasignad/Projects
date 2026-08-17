import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTimetableEntryDto } from './create-timetable-entry.dto';

export class UpdateTimetableEntryDto extends PartialType(
  OmitType(CreateTimetableEntryDto, ['instituteId', 'timetableId'] as const),
) {}
