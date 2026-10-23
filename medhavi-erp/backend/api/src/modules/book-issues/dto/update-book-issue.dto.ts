import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBookIssueDto } from './create-book-issue.dto';

export class UpdateBookIssueDto extends PartialType(
  OmitType(CreateBookIssueDto, ['instituteId'] as const),
) {}
