import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFeeWaiverDto } from './create-fee-waiver.dto';

export class UpdateFeeWaiverDto extends PartialType(
  OmitType(CreateFeeWaiverDto, ['instituteId'] as const),
) {}
