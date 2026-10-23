import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlacementApplicationDto } from './create-placement-application.dto';

export class UpdatePlacementApplicationDto extends PartialType(
  OmitType(CreatePlacementApplicationDto, ['instituteId'] as const),
) {}
