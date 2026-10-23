import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePatentDto } from './create-patent.dto';

export class UpdatePatentDto extends PartialType(
  OmitType(CreatePatentDto, ['instituteId'] as const),
) {}
