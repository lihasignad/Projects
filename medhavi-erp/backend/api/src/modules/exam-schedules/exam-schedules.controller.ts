import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { ListExamSchedulesQueryDto } from './dto/list-exam-schedules.query';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';
import { ExamSchedulesService } from './exam-schedules.service';

@ApiTags('Exam Schedules') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'exam-schedules', version: '1' })
export class ExamSchedulesController {
  constructor(private readonly service: ExamSchedulesService) {}
  @Get() @RequirePermissions('exam-schedules.read') @ApiOperation({ summary: 'List exam schedules.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListExamSchedulesQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('exam-schedules.read') @ApiOperation({ summary: 'Get exam schedule by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('exam-schedules.create') @ApiOperation({ summary: 'Create an exam schedule.' })
  create(@Body() dto: CreateExamScheduleDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('exam-schedules.update') @ApiOperation({ summary: 'Update an exam schedule.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateExamScheduleDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('exam-schedules.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete an exam schedule.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('exam-schedules.restore') @ApiOperation({ summary: 'Restore an exam schedule.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
