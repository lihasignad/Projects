import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateModerationDto } from './create-moderation.dto';

export class UpdateModerationDto extends PartialType(
  OmitType(CreateModerationDto, ['instituteId', 'marksEntryId'] as const),
) {}
