import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTransportPassDto } from './create-transport-pass.dto';

export class UpdateTransportPassDto extends PartialType(
  OmitType(CreateTransportPassDto, ['instituteId'] as const),
) {}
