import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateInvigilationAssignmentDto } from './dto/create-invigilation-assignment.dto';
import { ListInvigilationAssignmentsQueryDto } from './dto/list-invigilation-assignments.query';
import { UpdateInvigilationAssignmentDto } from './dto/update-invigilation-assignment.dto';
import { InvigilationAssignmentsService } from './invigilation-assignments.service';

@ApiTags('Invigilation Assignments') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'invigilation-assignments', version: '1' })
export class InvigilationAssignmentsController {
  constructor(private readonly service: InvigilationAssignmentsService) {}
  @Get() @RequirePermissions('invigilation-assignments.read') @ApiOperation({ summary: 'List invigilation assignments.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListInvigilationAssignmentsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('invigilation-assignments.read') @ApiOperation({ summary: 'Get assignment by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('invigilation-assignments.create') @ApiOperation({ summary: 'Create assignment.' })
  create(@Body() dto: CreateInvigilationAssignmentDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('invigilation-assignments.update') @ApiOperation({ summary: 'Update assignment.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateInvigilationAssignmentDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('invigilation-assignments.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete assignment.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('invigilation-assignments.restore') @ApiOperation({ summary: 'Restore assignment.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
