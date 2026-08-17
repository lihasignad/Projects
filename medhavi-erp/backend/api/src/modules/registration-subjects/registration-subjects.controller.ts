import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateRegistrationSubjectDto } from './dto/create-registration-subject.dto';
import { ListRegistrationSubjectsQueryDto } from './dto/list-registration-subjects.query';
import { UpdateRegistrationSubjectDto } from './dto/update-registration-subject.dto';
import { RegistrationSubjectsService } from './registration-subjects.service';

@ApiTags('Registration Subjects') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'registration-subjects', version: '1' })
export class RegistrationSubjectsController {
  constructor(private readonly service: RegistrationSubjectsService) {}
  @Get() @RequirePermissions('registration-subjects.read') @ApiOperation({ summary: 'List registration subjects.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListRegistrationSubjectsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('registration-subjects.read') @ApiOperation({ summary: 'Get registration subject by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('registration-subjects.create') @ApiOperation({ summary: 'Create registration subject.' })
  create(@Body() dto: CreateRegistrationSubjectDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('registration-subjects.update') @ApiOperation({ summary: 'Update registration subject.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateRegistrationSubjectDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('registration-subjects.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete registration subject.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('registration-subjects.restore') @ApiOperation({ summary: 'Restore registration subject.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
