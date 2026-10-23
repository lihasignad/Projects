import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHostelAllocationDto } from './create-hostel-allocation.dto';

export class UpdateHostelAllocationDto extends PartialType(
  OmitType(CreateHostelAllocationDto, ['instituteId'] as const),
) {}
