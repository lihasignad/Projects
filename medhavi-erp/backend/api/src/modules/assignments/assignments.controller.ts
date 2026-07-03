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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ListAssignmentsQueryDto } from './dto/list-assignments.query';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

/**
 * AssignmentsController
 *
 * Permission keys mirror the assignment-categories module:
 *   assignments.read   | assignments.create
 *   assignments.update | assignments.delete
 *   assignments.restore
 */
@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'assignments', version: '1' })
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Get()
  @RequirePermissions('assignments.read')
  @ApiOperation({ summary: 'List assignments (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of assignments.' })
  list(@Query() query: ListAssignmentsQueryDto) {
    return this.assignments.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('assignments.read')
  @ApiOperation({ summary: 'Get a single assignment by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignments.findOne(id);
  }

  @Post()
  @RequirePermissions('assignments.create')
  @ApiOperation({ summary: 'Create a new assignment.' })
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignments.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('assignments.update')
  @ApiOperation({ summary: 'Update an assignment (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignments.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('assignments.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an assignment (sets deletedAt).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignments.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('assignments.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted assignment.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignments.restore(id);
  }
}
