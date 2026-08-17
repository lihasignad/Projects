import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAttendanceSessionDto } from './create-attendance-session.dto';

export class UpdateAttendanceSessionDto extends PartialType(
  OmitType(CreateAttendanceSessionDto, ['instituteId', 'classSessionId'] as const),
) {}
