import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateExamDto } from './dto/create-exam.dto';
import { ListExamsQueryDto } from './dto/list-exams.query';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamsService } from './exams.service';

@ApiTags('Exams') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'exams', version: '1' })
export class ExamsController {
  constructor(private readonly exams: ExamsService) {}
  @Get() @RequirePermissions('exams.read') @ApiOperation({ summary: 'List exams.' }) @ApiOkResponse({ description: 'Paginated list of exams.' })
  list(@Query() query: ListExamsQueryDto) { return this.exams.findAll(query); }
  @Get(':id') @RequirePermissions('exams.read') @ApiOperation({ summary: 'Get an exam by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.exams.findOne(id); }
  @Post() @RequirePermissions('exams.create') @ApiOperation({ summary: 'Create an exam.' })
  create(@Body() dto: CreateExamDto) { return this.exams.create(dto); }
  @Patch(':id') @RequirePermissions('exams.update') @ApiOperation({ summary: 'Update an exam.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateExamDto) { return this.exams.update(id, dto); }
  @Delete(':id') @RequirePermissions('exams.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete an exam.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.exams.remove(id); }
  @Post(':id/restore') @RequirePermissions('exams.restore') @ApiOperation({ summary: 'Restore an exam.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.exams.restore(id); }
}
