import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuizBankDto } from './create-quiz-bank.dto';

/**
 * UpdateQuizBankDto
 *
 * All fields optional except `instituteId`, `ownerFacultyId`, `courseId`,
 * and `subjectId`, which are immutable after creation (a quiz bank cannot
 * migrate between institutes, owners, or course/subject parents).
 */
export class UpdateQuizBankDto extends PartialType(
  OmitType(CreateQuizBankDto, [
    'instituteId',
    'ownerFacultyId',
    'courseId',
    'subjectId',
  ] as const),
) {}
