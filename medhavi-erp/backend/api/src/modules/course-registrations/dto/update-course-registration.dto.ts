import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCourseRegistrationDto } from './create-course-registration.dto';

export class UpdateCourseRegistrationDto extends PartialType(
  OmitType(CreateCourseRegistrationDto, ['instituteId', 'cycleId', 'studentId', 'termId'] as const),
) {}
