import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

/**
 * UpdateStudentDto
 *
 * All fields optional except `instituteId` and `userId`, which are immutable
 * after creation (parity with ProgramsModule's `instituteId` handling).
 */
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['instituteId', 'userId'] as const),
) {}
