import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { ListWalletTransactionsQueryDto } from './dto/list-wallet-transactions.query';
import { UpdateWalletTransactionDto } from './dto/update-wallet-transaction.dto';
import { WalletTransactionsService } from './wallet-transactions.service';

@ApiTags('Wallet Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'wallet-transactions', version: '1' })
export class WalletTransactionsController {
  constructor(private readonly walletTransactions: WalletTransactionsService) {}

  @Get()
  @RequirePermissions('wallet-transactions.read')
  @ApiOperation({ summary: 'List wallet transactions (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of wallet transactions.' })
  list(@Query() query: ListWalletTransactionsQueryDto) {
    return this.walletTransactions.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('wallet-transactions.read')
  @ApiOperation({ summary: 'Get a single walletTransaction by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.walletTransactions.findOne(id);
  }

  @Post()
  @RequirePermissions('wallet-transactions.create')
  @ApiOperation({ summary: 'Create a new walletTransaction.' })
  create(@Body() dto: CreateWalletTransactionDto) {
    return this.walletTransactions.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('wallet-transactions.update')
  @ApiOperation({ summary: 'Update a walletTransaction (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWalletTransactionDto,
  ) {
    return this.walletTransactions.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('wallet-transactions.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a walletTransaction.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.walletTransactions.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('wallet-transactions.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted walletTransaction.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.walletTransactions.restore(id);
  }
}
