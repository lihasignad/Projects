import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateMentorshipDto } from './create-mentorship.dto';

export class UpdateMentorshipDto extends PartialType(
  OmitType(CreateMentorshipDto, ['instituteId', 'mentorFacultyId', 'studentId'] as const),
) {}
