import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateWalletTransactionDto } from './create-wallet-transaction.dto';

export class UpdateWalletTransactionDto extends PartialType(
  OmitType(CreateWalletTransactionDto, ['instituteId'] as const),
) {}
