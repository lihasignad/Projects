import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateMarksEntryDto } from './dto/create-marks-entry.dto';
import { ListMarksEntriesQueryDto } from './dto/list-marks-entries.query';
import { UpdateMarksEntryDto } from './dto/update-marks-entry.dto';
import { MarksEntriesService } from './marks-entries.service';

@ApiTags('Marks Entries') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'marks-entries', version: '1' })
export class MarksEntriesController {
  constructor(private readonly service: MarksEntriesService) {}
  @Get() @RequirePermissions('marks-entries.read') @ApiOperation({ summary: 'List marks entries.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListMarksEntriesQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('marks-entries.read') @ApiOperation({ summary: 'Get marks entry by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('marks-entries.create') @ApiOperation({ summary: 'Create marks entry.' })
  create(@Body() dto: CreateMarksEntryDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('marks-entries.update') @ApiOperation({ summary: 'Update marks entry.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateMarksEntryDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('marks-entries.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete marks entry.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('marks-entries.restore') @ApiOperation({ summary: 'Restore marks entry.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
