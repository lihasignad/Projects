import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CourseRegistrationsService } from './course-registrations.service';
import { CreateCourseRegistrationDto } from './dto/create-course-registration.dto';
import { ListCourseRegistrationsQueryDto } from './dto/list-course-registrations.query';
import { UpdateCourseRegistrationDto } from './dto/update-course-registration.dto';

@ApiTags('Course Registrations') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'course-registrations', version: '1' })
export class CourseRegistrationsController {
  constructor(private readonly service: CourseRegistrationsService) {}
  @Get() @RequirePermissions('course-registrations.read') @ApiOperation({ summary: 'List course registrations.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListCourseRegistrationsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('course-registrations.read') @ApiOperation({ summary: 'Get course registration by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('course-registrations.create') @ApiOperation({ summary: 'Create course registration.' })
  create(@Body() dto: CreateCourseRegistrationDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('course-registrations.update') @ApiOperation({ summary: 'Update course registration.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCourseRegistrationDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('course-registrations.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete course registration.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('course-registrations.restore') @ApiOperation({ summary: 'Restore course registration.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
