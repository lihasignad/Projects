import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateLibraryFineDto } from './create-library-fine.dto';

export class UpdateLibraryFineDto extends PartialType(
  OmitType(CreateLibraryFineDto, ['instituteId'] as const),
) {}
