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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsQueryDto } from './dto/list-payments.query';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'payments', version: '1' })
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @RequirePermissions('payments.read')
  @ApiOperation({ summary: 'List payments (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of payments.' })
  list(@Query() query: ListPaymentsQueryDto) {
    return this.payments.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('payments.read')
  @ApiOperation({ summary: 'Get a single payment by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payments.findOne(id);
  }

  @Post()
  @RequirePermissions('payments.create')
  @ApiOperation({ summary: 'Create a new payment.' })
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('payments.update')
  @ApiOperation({ summary: 'Update a payment (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.payments.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('payments.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a payment.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payments.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('payments.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted payment.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.payments.restore(id);
  }
}
