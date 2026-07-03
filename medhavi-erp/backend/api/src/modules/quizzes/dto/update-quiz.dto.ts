import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';

/**
 * UpdateQuizDto
 *
 * All fields optional except `instituteId` and `createdByFacultyId`, which
 * are immutable after creation (a quiz cannot migrate between institutes
 * or be re-authored — replace it by creating a new record).
 */
export class UpdateQuizDto extends PartialType(
  OmitType(CreateQuizDto, [
    'instituteId',
    'createdByFacultyId',
  ] as const),
) {}
