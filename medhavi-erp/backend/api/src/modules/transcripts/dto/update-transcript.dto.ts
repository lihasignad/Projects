import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTranscriptDto } from './create-transcript.dto';

export class UpdateTranscriptDto extends PartialType(
  OmitType(CreateTranscriptDto, ['instituteId', 'studentId', 'verificationCode'] as const),
) {}
