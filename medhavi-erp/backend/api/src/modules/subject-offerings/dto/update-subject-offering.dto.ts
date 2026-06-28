import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSubjectOfferingDto } from './create-subject-offering.dto';

/**
 * UpdateSubjectOfferingDto
 *
 * All fields optional except `instituteId`, which is immutable after creation
 * (parity with SectionsModule). Other parent references (subject, term,
 * department, program, section) may be re-pointed within the same institute
 * and are re-validated in the service.
 */
export class UpdateSubjectOfferingDto extends PartialType(
  OmitType(CreateSubjectOfferingDto, ['instituteId'] as const),
) {}
