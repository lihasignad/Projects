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
import { DiscussionCommentsService } from './discussion-comments.service';
import { CreateDiscussionCommentDto } from './dto/create-discussion-comment.dto';
import { ListDiscussionCommentsQueryDto } from './dto/list-discussion-comments.query';
import { UpdateDiscussionCommentDto } from './dto/update-discussion-comment.dto';

/**
 * DiscussionCommentsController
 *
 * Permission keys mirror the discussion-threads / resources modules:
 *   discussion-comments.read    | discussion-comments.create
 *   discussion-comments.update  | discussion-comments.delete
 *   discussion-comments.restore
 */
@ApiTags('Discussion Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'discussion-comments', version: '1' })
export class DiscussionCommentsController {
  constructor(private readonly comments: DiscussionCommentsService) {}

  @Get()
  @RequirePermissions('discussion-comments.read')
  @ApiOperation({
    summary: 'List discussion comments (paginated, filterable).',
  })
  @ApiOkResponse({ description: 'Paginated list of discussion comments.' })
  list(@Query() query: ListDiscussionCommentsQueryDto) {
    return this.comments.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('discussion-comments.read')
  @ApiOperation({ summary: 'Get a single discussion comment by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.comments.findOne(id);
  }

  @Post()
  @RequirePermissions('discussion-comments.create')
  @ApiOperation({ summary: 'Create a new discussion comment.' })
  create(@Body() dto: CreateDiscussionCommentDto) {
    return this.comments.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('discussion-comments.update')
  @ApiOperation({ summary: 'Update a discussion comment (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDiscussionCommentDto,
  ) {
    return this.comments.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('discussion-comments.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a discussion comment (sets deletedAt).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.comments.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('discussion-comments.restore')
  @ApiOperation({
    summary: 'Restore a previously soft-deleted discussion comment.',
  })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.comments.restore(id);
  }
}
