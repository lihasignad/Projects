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
import { QuizAttemptsService } from './quiz-attempts.service';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';
import { ListQuizAttemptsQueryDto } from './dto/list-quiz-attempts.query';
import { UpdateQuizAttemptDto } from './dto/update-quiz-attempt.dto';

/**
 * QuizAttemptsController
 *
 * Permission keys mirror the quizzes module:
 *   quiz-attempts.read    | quiz-attempts.create
 *   quiz-attempts.update  | quiz-attempts.delete
 *   quiz-attempts.restore
 */
@ApiTags('Quiz Attempts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'quiz-attempts', version: '1' })
export class QuizAttemptsController {
  constructor(private readonly attempts: QuizAttemptsService) {}

  @Get()
  @RequirePermissions('quiz-attempts.read')
  @ApiOperation({ summary: 'List quiz attempts (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of quiz attempts.' })
  list(@Query() query: ListQuizAttemptsQueryDto) {
    return this.attempts.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('quiz-attempts.read')
  @ApiOperation({ summary: 'Get a single quiz attempt by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attempts.findOne(id);
  }

  @Post()
  @RequirePermissions('quiz-attempts.create')
  @ApiOperation({ summary: 'Create (start) a new quiz attempt.' })
  create(@Body() dto: CreateQuizAttemptDto) {
    return this.attempts.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('quiz-attempts.update')
  @ApiOperation({ summary: 'Update a quiz attempt (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateQuizAttemptDto,
  ) {
    return this.attempts.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('quiz-attempts.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a quiz attempt (sets deletedAt).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attempts.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('quiz-attempts.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted quiz attempt.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attempts.restore(id);
  }
}
