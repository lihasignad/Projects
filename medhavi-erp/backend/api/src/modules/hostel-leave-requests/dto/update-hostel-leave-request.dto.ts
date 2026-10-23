import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHostelLeaveRequestDto } from './create-hostel-leave-request.dto';

export class UpdateHostelLeaveRequestDto extends PartialType(
  OmitType(CreateHostelLeaveRequestDto, ['instituteId'] as const),
) {}
