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
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { CreateAssignmentSubmissionDto } from './dto/create-assignment-submission.dto';
import { ListAssignmentSubmissionsQueryDto } from './dto/list-assignment-submissions.query';
import { UpdateAssignmentSubmissionDto } from './dto/update-assignment-submission.dto';

/**
 * AssignmentSubmissionsController
 *
 * Permission keys mirror the assignments module:
 *   assignment-submissions.read    | assignment-submissions.create
 *   assignment-submissions.update  | assignment-submissions.delete
 *   assignment-submissions.restore
 */
@ApiTags('Assignment Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'assignment-submissions', version: '1' })
export class AssignmentSubmissionsController {
  constructor(private readonly submissions: AssignmentSubmissionsService) {}

  @Get()
  @RequirePermissions('assignment-submissions.read')
  @ApiOperation({
    summary: 'List assignment submissions (paginated, filterable).',
  })
  @ApiOkResponse({ description: 'Paginated list of assignment submissions.' })
  list(@Query() query: ListAssignmentSubmissionsQueryDto) {
    return this.submissions.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('assignment-submissions.read')
  @ApiOperation({ summary: 'Get a single assignment submission by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.submissions.findOne(id);
  }

  @Post()
  @RequirePermissions('assignment-submissions.create')
  @ApiOperation({ summary: 'Create a new assignment submission.' })
  create(@Body() dto: CreateAssignmentSubmissionDto) {
    return this.submissions.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('assignment-submissions.update')
  @ApiOperation({ summary: 'Update an assignment submission (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAssignmentSubmissionDto,
  ) {
    return this.submissions.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('assignment-submissions.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete an assignment submission (sets deletedAt).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.submissions.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('assignment-submissions.restore')
  @ApiOperation({
    summary: 'Restore a previously soft-deleted assignment submission.',
  })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.submissions.restore(id);
  }
}
