import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTransportStopDto } from './create-transport-stop.dto';

export class UpdateTransportStopDto extends PartialType(
  OmitType(CreateTransportStopDto, ['instituteId'] as const),
) {}
