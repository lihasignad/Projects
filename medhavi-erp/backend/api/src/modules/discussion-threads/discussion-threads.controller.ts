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
import { DiscussionThreadsService } from './discussion-threads.service';
import { CreateDiscussionThreadDto } from './dto/create-discussion-thread.dto';
import { ListDiscussionThreadsQueryDto } from './dto/list-discussion-threads.query';
import { UpdateDiscussionThreadDto } from './dto/update-discussion-thread.dto';

/**
 * DiscussionThreadsController
 *
 * Permission keys mirror the resources / courses modules:
 *   discussion-threads.read   | discussion-threads.create
 *   discussion-threads.update | discussion-threads.delete
 *   discussion-threads.restore
 */
@ApiTags('Discussion Threads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'discussion-threads', version: '1' })
export class DiscussionThreadsController {
  constructor(private readonly threads: DiscussionThreadsService) {}

  @Get()
  @RequirePermissions('discussion-threads.read')
  @ApiOperation({ summary: 'List discussion threads (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of discussion threads.' })
  list(@Query() query: ListDiscussionThreadsQueryDto) {
    return this.threads.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('discussion-threads.read')
  @ApiOperation({ summary: 'Get a single discussion thread by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.threads.findOne(id);
  }

  @Post()
  @RequirePermissions('discussion-threads.create')
  @ApiOperation({ summary: 'Create a new discussion thread.' })
  create(@Body() dto: CreateDiscussionThreadDto) {
    return this.threads.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('discussion-threads.update')
  @ApiOperation({ summary: 'Update a discussion thread (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDiscussionThreadDto,
  ) {
    return this.threads.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('discussion-threads.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a discussion thread (sets deletedAt).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.threads.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('discussion-threads.restore')
  @ApiOperation({
    summary: 'Restore a previously soft-deleted discussion thread.',
  })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.threads.restore(id);
  }
}
