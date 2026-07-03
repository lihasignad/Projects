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
import { AssignmentCategoriesService } from './assignment-categories.service';
import { CreateAssignmentCategoryDto } from './dto/create-assignment-category.dto';
import { ListAssignmentCategoriesQueryDto } from './dto/list-assignment-categories.query';
import { UpdateAssignmentCategoryDto } from './dto/update-assignment-category.dto';

/**
 * AssignmentCategoriesController
 *
 * Permission keys mirror the lms-sessions module:
 *   assignment-categories.read   | assignment-categories.create
 *   assignment-categories.update | assignment-categories.delete
 *   assignment-categories.restore
 */
@ApiTags('Assignment Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'assignment-categories', version: '1' })
export class AssignmentCategoriesController {
  constructor(
    private readonly assignmentCategories: AssignmentCategoriesService,
  ) {}

  @Get()
  @RequirePermissions('assignment-categories.read')
  @ApiOperation({
    summary: 'List assignment categories (paginated, filterable).',
  })
  @ApiOkResponse({ description: 'Paginated list of assignment categories.' })
  list(@Query() query: ListAssignmentCategoriesQueryDto) {
    return this.assignmentCategories.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('assignment-categories.read')
  @ApiOperation({ summary: 'Get a single assignment category by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignmentCategories.findOne(id);
  }

  @Post()
  @RequirePermissions('assignment-categories.create')
  @ApiOperation({ summary: 'Create a new assignment category.' })
  create(@Body() dto: CreateAssignmentCategoryDto) {
    return this.assignmentCategories.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('assignment-categories.update')
  @ApiOperation({ summary: 'Update an assignment category (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAssignmentCategoryDto,
  ) {
    return this.assignmentCategories.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('assignment-categories.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete an assignment category (sets deletedAt).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignmentCategories.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('assignment-categories.restore')
  @ApiOperation({
    summary: 'Restore a previously soft-deleted assignment category.',
  })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.assignmentCategories.restore(id);
  }
}
