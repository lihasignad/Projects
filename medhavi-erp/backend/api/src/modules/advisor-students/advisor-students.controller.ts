import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AdvisorStudentsService } from './advisor-students.service';
import { CreateAdvisorStudentDto } from './dto/create-advisor-student.dto';
import { ListAdvisorStudentsQueryDto } from './dto/list-advisor-students.query';
import { UpdateAdvisorStudentDto } from './dto/update-advisor-student.dto';

@ApiTags('Advisor Students') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'advisor-students', version: '1' })
export class AdvisorStudentsController {
  constructor(private readonly service: AdvisorStudentsService) {}
  @Get() @RequirePermissions('advisor-students.read') @ApiOperation({ summary: 'List advisor students.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListAdvisorStudentsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('advisor-students.read') @ApiOperation({ summary: 'Get advisor student by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('advisor-students.create') @ApiOperation({ summary: 'Create advisor student.' })
  create(@Body() dto: CreateAdvisorStudentDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('advisor-students.update') @ApiOperation({ summary: 'Update advisor student.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateAdvisorStudentDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('advisor-students.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete advisor student.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('advisor-students.restore') @ApiOperation({ summary: 'Restore advisor student.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
