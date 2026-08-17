import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateInvigilationAssignmentDto } from './create-invigilation-assignment.dto';

export class UpdateInvigilationAssignmentDto extends PartialType(
  OmitType(CreateInvigilationAssignmentDto, ['instituteId', 'examScheduleId', 'facultyId'] as const),
) {}
