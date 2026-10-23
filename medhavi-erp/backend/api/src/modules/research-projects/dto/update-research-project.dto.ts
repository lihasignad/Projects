import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateResearchProjectDto } from './create-research-project.dto';

export class UpdateResearchProjectDto extends PartialType(
  OmitType(CreateResearchProjectDto, ['instituteId'] as const),
) {}
