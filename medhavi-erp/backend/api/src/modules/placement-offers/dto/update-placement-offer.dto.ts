import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlacementOfferDto } from './create-placement-offer.dto';

export class UpdatePlacementOfferDto extends PartialType(
  OmitType(CreatePlacementOfferDto, ['instituteId'] as const),
) {}
