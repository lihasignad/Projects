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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { ListBatchesQueryDto } from './dto/list-batches.query';
import { UpdateBatchDto } from './dto/update-batch.dto';

/**
 * BatchesController
 *
 * Permission keys mirror the programs module:
 *   batches.read   | batches.create | batches.update
 *   batches.delete | batches.restore
 */
@ApiTags('Batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'batches', version: '1' })
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Get()
  @RequirePermissions('batches.read')
  @ApiOperation({ summary: 'List batches (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of batches.' })
  list(@Query() query: ListBatchesQueryDto) {
    return this.batches.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('batches.read')
  @ApiOperation({ summary: 'Get a single batch by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.batches.findOne(id);
  }

  @Post()
  @RequirePermissions('batches.create')
  @ApiOperation({ summary: 'Create a new batch under a program.' })
  create(@Body() dto: CreateBatchDto) {
    return this.batches.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('batches.update')
  @ApiOperation({ summary: 'Update a batch (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBatchDto,
  ) {
    return this.batches.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('batches.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a batch (sets deletedAt, status=DISCONTINUED).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.batches.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('batches.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted batch.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.batches.restore(id);
  }
}
