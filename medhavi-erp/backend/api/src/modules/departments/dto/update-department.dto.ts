import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateDepartmentDto } from './create-department.dto';

/**
 * UpdateDepartmentDto
 *
 * All CreateDepartmentDto fields become optional EXCEPT `instituteId`,
 * which is immutable after creation (departments cannot be re-parented across
 * institutes). `campusId` and `schoolId` MAY change, but only to a school/campus
 * that still belongs to the same institute — enforced in the service layer.
 */
export class UpdateDepartmentDto extends PartialType(
  OmitType(CreateDepartmentDto, ['instituteId'] as const),
) {}
