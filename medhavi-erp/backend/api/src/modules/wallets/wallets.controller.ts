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
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ListWalletsQueryDto } from './dto/list-wallets.query';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { WalletsService } from './wallets.service';

@ApiTags('Wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'wallets', version: '1' })
export class WalletsController {
  constructor(private readonly wallets: WalletsService) {}

  @Get()
  @RequirePermissions('wallets.read')
  @ApiOperation({ summary: 'List wallets (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of wallets.' })
  list(@Query() query: ListWalletsQueryDto) {
    return this.wallets.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('wallets.read')
  @ApiOperation({ summary: 'Get a single wallet by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.wallets.findOne(id);
  }

  @Post()
  @RequirePermissions('wallets.create')
  @ApiOperation({ summary: 'Create a new wallet.' })
  create(@Body() dto: CreateWalletDto) {
    return this.wallets.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('wallets.update')
  @ApiOperation({ summary: 'Update a wallet (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.wallets.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('wallets.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a wallet.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.wallets.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('wallets.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted wallet.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.wallets.restore(id);
  }
}
