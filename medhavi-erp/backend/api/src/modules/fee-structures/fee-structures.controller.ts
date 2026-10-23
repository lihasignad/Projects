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
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { ListFeeStructuresQueryDto } from './dto/list-fee-structures.query';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { FeeStructuresService } from './fee-structures.service';

@ApiTags('Fee Structures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'fee-structures', version: '1' })
export class FeeStructuresController {
  constructor(private readonly feeStructures: FeeStructuresService) {}

  @Get()
  @RequirePermissions('fee-structures.read')
  @ApiOperation({ summary: 'List fee structures (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of fee structures.' })
  list(@Query() query: ListFeeStructuresQueryDto) {
    return this.feeStructures.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('fee-structures.read')
  @ApiOperation({ summary: 'Get a single feeStructure by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feeStructures.findOne(id);
  }

  @Post()
  @RequirePermissions('fee-structures.create')
  @ApiOperation({ summary: 'Create a new feeStructure.' })
  create(@Body() dto: CreateFeeStructureDto) {
    return this.feeStructures.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('fee-structures.update')
  @ApiOperation({ summary: 'Update a feeStructure (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateFeeStructureDto,
  ) {
    return this.feeStructures.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('fee-structures.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a feeStructure.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feeStructures.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('fee-structures.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted feeStructure.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feeStructures.restore(id);
  }
}
