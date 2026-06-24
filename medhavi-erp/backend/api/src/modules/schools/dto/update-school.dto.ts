import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateSchoolDto } from './create-school.dto';

/**
 * UpdateSchoolDto
 *
 * All CreateSchoolDto fields become optional EXCEPT `instituteId`,
 * which is immutable after creation (schools cannot be re-parented across
 * institutes). `campusId` MAY change, but only to another campus belonging
 * to the same institute — enforced in the service layer.
 */
export class UpdateSchoolDto extends PartialType(
  OmitType(CreateSchoolDto, ['instituteId'] as const),
) {}
