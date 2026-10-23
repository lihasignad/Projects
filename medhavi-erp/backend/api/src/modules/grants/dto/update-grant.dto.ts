import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGrantDto } from './create-grant.dto';

export class UpdateGrantDto extends PartialType(
  OmitType(CreateGrantDto, ['instituteId'] as const),
) {}
