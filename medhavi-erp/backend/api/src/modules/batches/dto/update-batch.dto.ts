import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBatchDto } from './create-batch.dto';

/**
 * UpdateBatchDto
 *
 * All CreateBatchDto fields become optional EXCEPT `instituteId` and
 * `programId`, which are immutable after creation (batches cannot be
 * re-parented across institutes or programs — that would invalidate the
 * `(programId, code)` uniqueness invariant and enrolled student linkages).
 */
export class UpdateBatchDto extends PartialType(
  OmitType(CreateBatchDto, ['instituteId', 'programId'] as const),
) {}
