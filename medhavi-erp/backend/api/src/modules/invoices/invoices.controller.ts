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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ListInvoicesQueryDto } from './dto/list-invoices.query';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'invoices', version: '1' })
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  @RequirePermissions('invoices.read')
  @ApiOperation({ summary: 'List invoices (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of invoices.' })
  list(@Query() query: ListInvoicesQueryDto) {
    return this.invoices.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('invoices.read')
  @ApiOperation({ summary: 'Get a single invoice by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.invoices.findOne(id);
  }

  @Post()
  @RequirePermissions('invoices.create')
  @ApiOperation({ summary: 'Create a new invoice.' })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoices.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('invoices.update')
  @ApiOperation({ summary: 'Update a invoice (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoices.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('invoices.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a invoice.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.invoices.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('invoices.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted invoice.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.invoices.restore(id);
  }
}
