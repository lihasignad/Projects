import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateExamScheduleDto } from './create-exam-schedule.dto';

export class UpdateExamScheduleDto extends PartialType(
  OmitType(CreateExamScheduleDto, ['instituteId', 'examId'] as const),
) {}
