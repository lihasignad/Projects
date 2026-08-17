import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateRegistrationSubjectDto } from './create-registration-subject.dto';

export class UpdateRegistrationSubjectDto extends PartialType(
  OmitType(CreateRegistrationSubjectDto, ['instituteId', 'registrationId', 'subjectOfferingId'] as const),
) {}
