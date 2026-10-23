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
import { CreateFeeWaiverDto } from './dto/create-fee-waiver.dto';
import { ListFeeWaiversQueryDto } from './dto/list-fee-waivers.query';
import { UpdateFeeWaiverDto } from './dto/update-fee-waiver.dto';
import { FeeWaiversService } from './fee-waivers.service';

@ApiTags('Fee Waivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'fee-waivers', version: '1' })
export class FeeWaiversController {
  constructor(private readonly feeWaivers: FeeWaiversService) {}

  @Get()
  @RequirePermissions('fee-waivers.read')
  @ApiOperation({ summary: 'List fee waivers (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of fee waivers.' })
  list(@Query() query: ListFeeWaiversQueryDto) {
    return this.feeWaivers.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('fee-waivers.read')
  @ApiOperation({ summary: 'Get a single feeWaiver by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feeWaivers.findOne(id);
  }

  @Post()
  @RequirePermissions('fee-waivers.create')
  @ApiOperation({ summary: 'Create a new feeWaiver.' })
  create(@Body() dto: CreateFeeWaiverDto) {
    return this.feeWaivers.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('fee-waivers.update')
  @ApiOperation({ summary: 'Update a feeWaiver (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateFeeWaiverDto,
  ) {
    return this.feeWaivers.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('fee-waivers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a feeWaiver.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feeWaivers.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('fee-waivers.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted feeWaiver.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feeWaivers.restore(id);
  }
}
