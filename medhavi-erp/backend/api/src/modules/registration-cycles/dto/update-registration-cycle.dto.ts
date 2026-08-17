import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRegistrationCycleDto } from './create-registration-cycle.dto';

export class UpdateRegistrationCycleDto extends PartialType(
  OmitType(CreateRegistrationCycleDto, ['instituteId', 'termId'] as const),
) {}
