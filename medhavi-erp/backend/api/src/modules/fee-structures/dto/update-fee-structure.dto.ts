import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateFeeStructureDto } from './create-fee-structure.dto';

export class UpdateFeeStructureDto extends PartialType(
  OmitType(CreateFeeStructureDto, ['instituteId'] as const),
) {}
