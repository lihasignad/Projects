import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto
 *
 * Mirrors UpdateProgramDto: all CreateUserDto fields become optional, and
 * the parent `instituteId` is removed — moving a user across institutes is
 * an explicit, audited operation that does not belong in a generic PATCH.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['instituteId'] as const),
) {}
