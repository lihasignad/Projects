import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';

export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, ['instituteId'] as const),
) {}
