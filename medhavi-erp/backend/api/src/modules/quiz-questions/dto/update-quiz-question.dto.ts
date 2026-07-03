import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateQuizQuestionDto } from './create-quiz-question.dto';

/**
 * UpdateQuizQuestionDto
 *
 * All fields optional except `instituteId` and `quizBankId`, which are
 * immutable after creation (a question cannot migrate between institutes
 * or between quiz banks — move it by creating a new record).
 */
export class UpdateQuizQuestionDto extends PartialType(
  OmitType(CreateQuizQuestionDto, ['instituteId', 'quizBankId'] as const),
) {}
