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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsQueryDto } from './dto/list-students.query';
import { UpdateStudentDto } from './dto/update-student.dto';

/**
 * StudentsController
 *
 * Permission keys mirror the programs module:
 *   students.read   | students.create | students.update
 *   students.delete | students.restore
 */
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'students', version: '1' })
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'List students (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of students.' })
  list(@Query() query: ListStudentsQueryDto) {
    return this.students.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('students.read')
  @ApiOperation({ summary: 'Get a single student by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.students.findOne(id);
  }

  @Post()
  @RequirePermissions('students.create')
  @ApiOperation({ summary: 'Create a new student under a program/batch.' })
  create(@Body() dto: CreateStudentDto) {
    return this.students.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('students.update')
  @ApiOperation({ summary: 'Update a student (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.students.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('students.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a student (sets deletedAt, status=WITHDRAWN).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.students.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('students.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted student.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.students.restore(id);
  }
}
