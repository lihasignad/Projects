import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlacementDriveDto } from './create-placement-drive.dto';

export class UpdatePlacementDriveDto extends PartialType(
  OmitType(CreatePlacementDriveDto, ['instituteId'] as const),
) {}
