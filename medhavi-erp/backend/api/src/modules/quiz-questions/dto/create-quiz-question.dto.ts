import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuizDifficulty, QuizQuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * CreateQuizQuestionDto
 *
 * Fields mirror the Prisma `QuizQuestion` model exactly:
 *   instituteId, quizBankId, type, difficulty?, stemMarkdown, optionsJson?,
 *   correctJson, explanation?, marks?, negativeMarks?, tags?
 *
 * Business rules (enforced in the service):
 *   - Institute and QuizBank must exist and QuizBank must belong to the
 *     institute.
 *   - `marks` must be > 0.
 *   - `negativeMarks` must be >= 0.
 *   - `stemMarkdown` cannot be empty.
 *   - `correctJson` cannot be empty.
 *   - `optionsJson` is required for objective question types
 *     (MCQ_SINGLE, MCQ_MULTI, TRUE_FALSE, MATCHING).
 */
export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiProperty({ description: 'Parent QuizBank UUID.', format: 'uuid' })
  @IsUUID()
  quizBankId!: string;

  @ApiProperty({ description: 'Question type.', enum: QuizQuestionType })
  @IsEnum(QuizQuestionType)
  type!: QuizQuestionType;

  @ApiPropertyOptional({
    description: 'Difficulty level.',
    enum: QuizDifficulty,
    default: QuizDifficulty.MEDIUM,
  })
  @IsOptional()
  @IsEnum(QuizDifficulty)
  difficulty?: QuizDifficulty;

  @ApiProperty({ description: 'Question stem, Markdown formatted.' })
  @IsString()
  @IsNotEmpty()
  stemMarkdown!: string;

  @ApiPropertyOptional({
    description:
      'Options payload (JSON). Required for objective question types.',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  optionsJson?: Record<string, unknown>;

  @ApiProperty({
    description: 'Canonical answer payload (JSON). Cannot be empty.',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  correctJson!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Answer explanation.' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({
    description: 'Marks awarded on a correct answer. Decimal(6,2). Must be > 0.',
    default: 1,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marks?: number;

  @ApiPropertyOptional({
    description:
      'Negative marks on an incorrect answer. Decimal(6,2). Must be >= 0.',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  negativeMarks?: number;

  @ApiPropertyOptional({
    description: 'Free-form tags for filtering/search.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  tags?: string[];
}
