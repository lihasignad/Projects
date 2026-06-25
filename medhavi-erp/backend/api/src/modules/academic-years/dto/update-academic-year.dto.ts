import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAcademicYearDto } from './create-academic-year.dto';

/**
 * UpdateAcademicYearDto
 *
 * All CreateAcademicYearDto fields become optional EXCEPT `instituteId`,
 * which is immutable after creation (academic years cannot be re-parented
 * across institutes).
 */
export class UpdateAcademicYearDto extends PartialType(
  OmitType(CreateAcademicYearDto, ['instituteId'] as const),
) {}
