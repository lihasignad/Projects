import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProgramDto } from './create-program.dto';

/**
 * UpdateProgramDto
 *
 * All CreateProgramDto fields become optional EXCEPT `instituteId`, which is
 * immutable after creation (programs cannot be re-parented across institutes).
 * `campusId`, `schoolId`, and `departmentId` MAY change, but only to a
 * department/school/campus that still belongs to the same institute — enforced
 * in the service layer.
 */
export class UpdateProgramDto extends PartialType(
  OmitType(CreateProgramDto, ['instituteId'] as const),
) {}
