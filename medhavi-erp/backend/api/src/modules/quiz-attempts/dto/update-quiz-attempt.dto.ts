import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuizAttemptDto } from './create-quiz-attempt.dto';

/**
 * UpdateQuizAttemptDto
 *
 * All fields optional except `instituteId`, `quizId`, `studentId` and
 * `attemptNumber`, which are immutable after creation (an attempt cannot
 * migrate between institutes, quizzes or students, and its ordinal is
 * fixed — replace it by creating a new record).
 */
export class UpdateQuizAttemptDto extends PartialType(
  OmitType(CreateQuizAttemptDto, [
    'instituteId',
    'quizId',
    'studentId',
    'attemptNumber',
  ] as const),
) {}
