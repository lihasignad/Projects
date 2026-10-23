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
import { CreateHostelAllocationDto } from './dto/create-hostel-allocation.dto';
import { ListHostelAllocationsQueryDto } from './dto/list-hostel-allocations.query';
import { UpdateHostelAllocationDto } from './dto/update-hostel-allocation.dto';
import { HostelAllocationsService } from './hostel-allocations.service';

@ApiTags('Hostel Allocations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'hostel-allocations', version: '1' })
export class HostelAllocationsController {
  constructor(private readonly hostelAllocations: HostelAllocationsService) {}

  @Get()
  @RequirePermissions('hostel-allocations.read')
  @ApiOperation({ summary: 'List hostel allocations (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of hostel allocations.' })
  list(@Query() query: ListHostelAllocationsQueryDto) {
    return this.hostelAllocations.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hostel-allocations.read')
  @ApiOperation({ summary: 'Get a single hostelAllocation by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelAllocations.findOne(id);
  }

  @Post()
  @RequirePermissions('hostel-allocations.create')
  @ApiOperation({ summary: 'Create a new hostelAllocation.' })
  create(@Body() dto: CreateHostelAllocationDto) {
    return this.hostelAllocations.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('hostel-allocations.update')
  @ApiOperation({ summary: 'Update a hostelAllocation (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHostelAllocationDto,
  ) {
    return this.hostelAllocations.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('hostel-allocations.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a hostelAllocation.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelAllocations.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('hostel-allocations.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted hostelAllocation.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelAllocations.restore(id);
  }
}
