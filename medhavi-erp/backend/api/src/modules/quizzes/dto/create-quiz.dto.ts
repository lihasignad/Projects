import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * CreateQuizDto
 *
 * Fields mirror the Prisma `Quiz` model exactly:
 *   instituteId, quizBankId?, courseId?, subjectOfferingId?,
 *   createdByFacultyId, title, instructions?, totalMarks, durationMin,
 *   startsAt, endsAt, maxAttempts?, shuffleQuestions?, shuffleOptions?,
 *   showResultsImmediately?, passingMarks?, isProctored?
 *
 * Business rules (enforced in the service):
 *   - Institute, Faculty (same institute), QuizBank (same institute when
 *     provided), Course and SubjectOffering (when provided) must exist.
 *   - Exactly one of `courseId` or `subjectOfferingId` must be provided.
 *   - `startsAt` < `endsAt`.
 *   - `durationMin` > 0.
 *   - `totalMarks` > 0.
 *   - `maxAttempts` >= 1.
 *   - `passingMarks` >= 0 and <= `totalMarks`.
 */
export class CreateQuizDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({
    description: 'Optional source QuizBank UUID.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  quizBankId?: string;

  @ApiPropertyOptional({
    description:
      'Course UUID. Exactly one of `courseId` or `subjectOfferingId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description:
      'Subject-offering UUID. Exactly one of `courseId` or `subjectOfferingId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiProperty({
    description: 'Faculty UUID of the quiz author.',
    format: 'uuid',
  })
  @IsUUID()
  createdByFacultyId!: string;

  @ApiProperty({ description: 'Quiz title.', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ description: 'Free-form instructions for students.' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    description: 'Total marks for the quiz. Decimal(8,2). Must be > 0.',
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  totalMarks!: number;

  @ApiProperty({
    description: 'Quiz duration in minutes. Must be > 0.',
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMin!: number;

  @ApiProperty({
    description: 'Quiz availability window start (ISO-8601).',
    format: 'date-time',
  })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({
    description: 'Quiz availability window end (ISO-8601).',
    format: 'date-time',
  })
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional({
    description: 'Maximum number of attempts per student.',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({
    description: 'Shuffle questions across attempts.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({
    description: 'Shuffle options within objective questions.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @ApiPropertyOptional({
    description: 'Reveal results to the student immediately on submission.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  showResultsImmediately?: boolean;

  @ApiPropertyOptional({
    description:
      'Optional passing marks. Decimal(8,2). Must be >= 0 and <= totalMarks.',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  passingMarks?: number;

  @ApiPropertyOptional({
    description: 'Whether the quiz is proctored.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isProctored?: boolean;
}
