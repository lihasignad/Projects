import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHelpCenterArticleDto } from './create-help-center-article.dto';

export class UpdateHelpCenterArticleDto extends PartialType(
  OmitType(CreateHelpCenterArticleDto, ['instituteId'] as const),
) {}
