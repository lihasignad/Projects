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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query';
import { UpdateDepartmentDto } from './dto/update-department.dto';

/**
 * DepartmentsController
 *
 * Permission keys mirror the schools module:
 *   departments.read   | departments.create | departments.update
 *   departments.delete | departments.restore
 */
@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'departments', version: '1' })
export class DepartmentsController {
  constructor(private readonly departments: DepartmentsService) {}

  @Get()
  @RequirePermissions('departments.read')
  @ApiOperation({ summary: 'List departments (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of departments.' })
  list(@Query() query: ListDepartmentsQueryDto) {
    return this.departments.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('departments.read')
  @ApiOperation({ summary: 'Get a single department by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.departments.findOne(id);
  }

  @Post()
  @RequirePermissions('departments.create')
  @ApiOperation({ summary: 'Create a new department under a school.' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departments.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('departments.update')
  @ApiOperation({ summary: 'Update a department (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departments.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('departments.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a department (sets deletedAt, status=ARCHIVED).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.departments.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('departments.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted department.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.departments.restore(id);
  }
}
