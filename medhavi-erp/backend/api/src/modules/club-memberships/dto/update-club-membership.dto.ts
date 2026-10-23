import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateClubMembershipDto } from './create-club-membership.dto';

export class UpdateClubMembershipDto extends PartialType(
  OmitType(CreateClubMembershipDto, ['instituteId'] as const),
) {}
