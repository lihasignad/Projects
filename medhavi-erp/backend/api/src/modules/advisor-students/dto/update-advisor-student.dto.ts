import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAdvisorStudentDto } from './create-advisor-student.dto';

export class UpdateAdvisorStudentDto extends PartialType(
  OmitType(CreateAdvisorStudentDto, ['instituteId', 'facultyAdvisorId', 'advisorFacultyId', 'studentId'] as const),
) {}
