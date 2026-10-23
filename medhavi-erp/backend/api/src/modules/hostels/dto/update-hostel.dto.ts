import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHostelDto } from './create-hostel.dto';

export class UpdateHostelDto extends PartialType(
  OmitType(CreateHostelDto, ['instituteId'] as const),
) {}
