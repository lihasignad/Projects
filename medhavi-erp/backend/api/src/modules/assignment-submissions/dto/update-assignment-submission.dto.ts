import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAssignmentSubmissionDto } from './create-assignment-submission.dto';

/**
 * UpdateAssignmentSubmissionDto
 *
 * All fields optional except `instituteId`, `assignmentId`, `studentId`, and
 * `attemptNumber`, which are immutable after creation (a submission cannot
 * migrate between institutes, assignments, students, or attempt slots — a
 * new attempt requires a new record).
 */
export class UpdateAssignmentSubmissionDto extends PartialType(
  OmitType(CreateAssignmentSubmissionDto, [
    'instituteId',
    'assignmentId',
    'studentId',
    'attemptNumber',
  ] as const),
) {}
