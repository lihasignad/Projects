import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFacultyWorkloadDto } from './create-faculty-workload.dto';

export class UpdateFacultyWorkloadDto extends PartialType(
  OmitType(CreateFacultyWorkloadDto, ['instituteId', 'facultyId', 'termId'] as const),
) {}
