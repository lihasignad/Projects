import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAttendanceRecordDto } from './create-attendance-record.dto';

export class UpdateAttendanceRecordDto extends PartialType(
  OmitType(CreateAttendanceRecordDto, ['instituteId', 'attendanceSessionId', 'studentId'] as const),
) {}
