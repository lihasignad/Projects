import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateFacultyWorkloadDto } from './dto/create-faculty-workload.dto';
import { ListFacultyWorkloadsQueryDto } from './dto/list-faculty-workloads.query';
import { UpdateFacultyWorkloadDto } from './dto/update-faculty-workload.dto';
import { FacultyWorkloadsService } from './faculty-workloads.service';

@ApiTags('Faculty Workloads') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'faculty-workloads', version: '1' })
export class FacultyWorkloadsController {
  constructor(private readonly service: FacultyWorkloadsService) {}
  @Get() @RequirePermissions('faculty-workloads.read') @ApiOperation({ summary: 'List faculty workloads.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListFacultyWorkloadsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('faculty-workloads.read') @ApiOperation({ summary: 'Get faculty workload by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('faculty-workloads.create') @ApiOperation({ summary: 'Create faculty workload.' })
  create(@Body() dto: CreateFacultyWorkloadDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('faculty-workloads.update') @ApiOperation({ summary: 'Update faculty workload.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateFacultyWorkloadDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('faculty-workloads.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete faculty workload.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('faculty-workloads.restore') @ApiOperation({ summary: 'Restore faculty workload.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
