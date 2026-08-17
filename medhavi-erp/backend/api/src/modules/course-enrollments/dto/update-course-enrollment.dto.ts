import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCourseEnrollmentDto } from './create-course-enrollment.dto';

export class UpdateCourseEnrollmentDto extends PartialType(
  OmitType(CreateCourseEnrollmentDto, ['instituteId', 'courseId', 'studentId'] as const),
) {}
