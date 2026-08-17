import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFacultyAdvisorDto } from './create-faculty-advisor.dto';

export class UpdateFacultyAdvisorDto extends PartialType(
  OmitType(CreateFacultyAdvisorDto, ['instituteId', 'facultyId'] as const),
) {}
