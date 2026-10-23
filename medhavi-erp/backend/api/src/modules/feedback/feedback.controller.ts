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
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ListFeedbackQueryDto } from './dto/list-feedback.query';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedback.service';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'feedback', version: '1' })
export class FeedbackController {
  constructor(private readonly feedback: FeedbackService) {}

  @Get()
  @RequirePermissions('feedback.read')
  @ApiOperation({ summary: 'List feedback (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of feedback.' })
  list(@Query() query: ListFeedbackQueryDto) {
    return this.feedback.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('feedback.read')
  @ApiOperation({ summary: 'Get a single feedback by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedback.findOne(id);
  }

  @Post()
  @RequirePermissions('feedback.create')
  @ApiOperation({ summary: 'Create a new feedback.' })
  create(@Body() dto: CreateFeedbackDto) {
    return this.feedback.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('feedback.update')
  @ApiOperation({ summary: 'Update a feedback (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    return this.feedback.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('feedback.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a feedback.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedback.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('feedback.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted feedback.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.feedback.restore(id);
  }
}
