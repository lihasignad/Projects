import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

/**
 * CreateAssignmentCategoryDto
 *
 * Fields mirror the Prisma `AssignmentCategory` model exactly:
 *   instituteId, subjectOfferingId?, courseId?, name, weightPct?, description?
 *
 * Business rule (enforced in the service): exactly one of `courseId` or
 * `subjectOfferingId` must be provided. Hierarchy validation (parent belongs
 * to same institute) and uniqueness invariants (`name` unique within course
 * and within subject offering) are also enforced in the service.
 */
export class CreateAssignmentCategoryDto {
  @ApiProperty({ description: 'Parent institute UUID.', format: 'uuid' })
  @IsUUID()
  instituteId!: string;

  @ApiPropertyOptional({
    description:
      'Owning Course UUID. Exactly one of `courseId` or `subjectOfferingId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({
    description:
      'Owning SubjectOffering UUID. Exactly one of `courseId` or `subjectOfferingId` must be provided.',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subjectOfferingId?: string;

  @ApiProperty({
    description: 'Category name (e.g. "Homework", "Quizzes", "Final Exam").',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  name!: string;

  @ApiPropertyOptional({
    description:
      'Weight percentage this category contributes to the final grade. Decimal(5,2).',
    minimum: 0,
    maximum: 100,
    default: 0,
    example: 25.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  weightPct?: number;

  @ApiPropertyOptional({ description: 'Long-form category description.' })
  @IsOptional()
  @IsString()
  description?: string;
}
