import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAssignmentDto } from './create-assignment.dto';

/**
 * UpdateAssignmentDto
 *
 * All fields optional except `instituteId`, `courseId`, `subjectOfferingId`,
 * and `createdByFacultyId`, which are immutable after creation (an
 * assignment cannot migrate between institutes, between course/subject-
 * offering parents, or change its authoring faculty).
 */
export class UpdateAssignmentDto extends PartialType(
  OmitType(CreateAssignmentDto, [
    'instituteId',
    'courseId',
    'subjectOfferingId',
    'createdByFacultyId',
  ] as const),
) {}
