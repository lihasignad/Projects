import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CourseEnrollmentsService } from './course-enrollments.service';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { ListCourseEnrollmentsQueryDto } from './dto/list-course-enrollments.query';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

@ApiTags('Course Enrollments') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'course-enrollments', version: '1' })
export class CourseEnrollmentsController {
  constructor(private readonly service: CourseEnrollmentsService) {}
  @Get() @RequirePermissions('course-enrollments.read') @ApiOperation({ summary: 'List course enrollments.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListCourseEnrollmentsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('course-enrollments.read') @ApiOperation({ summary: 'Get course enrollment by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('course-enrollments.create') @ApiOperation({ summary: 'Create course enrollment.' })
  create(@Body() dto: CreateCourseEnrollmentDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('course-enrollments.update') @ApiOperation({ summary: 'Update course enrollment.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateCourseEnrollmentDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('course-enrollments.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete course enrollment.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('course-enrollments.restore') @ApiOperation({ summary: 'Restore course enrollment.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
