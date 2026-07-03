import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAssignmentCategoryDto } from './create-assignment-category.dto';

/**
 * UpdateAssignmentCategoryDto
 *
 * All fields optional except `instituteId`, `courseId`, and
 * `subjectOfferingId`, which are immutable after creation (a category
 * cannot migrate between institutes or between course/subject-offering
 * parents).
 */
export class UpdateAssignmentCategoryDto extends PartialType(
  OmitType(CreateAssignmentCategoryDto, [
    'instituteId',
    'courseId',
    'subjectOfferingId',
  ] as const),
) {}
