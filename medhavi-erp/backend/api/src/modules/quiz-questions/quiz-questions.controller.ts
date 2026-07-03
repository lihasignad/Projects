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
import { QuizQuestionsService } from './quiz-questions.service';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { ListQuizQuestionsQueryDto } from './dto/list-quiz-questions.query';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';

/**
 * QuizQuestionsController
 *
 * Permission keys mirror the quiz-banks module:
 *   quiz-questions.read    | quiz-questions.create
 *   quiz-questions.update  | quiz-questions.delete
 *   quiz-questions.restore
 */
@ApiTags('Quiz Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'quiz-questions', version: '1' })
export class QuizQuestionsController {
  constructor(private readonly questions: QuizQuestionsService) {}

  @Get()
  @RequirePermissions('quiz-questions.read')
  @ApiOperation({ summary: 'List quiz questions (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of quiz questions.' })
  list(@Query() query: ListQuizQuestionsQueryDto) {
    return this.questions.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('quiz-questions.read')
  @ApiOperation({ summary: 'Get a single quiz question by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.questions.findOne(id);
  }

  @Post()
  @RequirePermissions('quiz-questions.create')
  @ApiOperation({ summary: 'Create a new quiz question.' })
  create(@Body() dto: CreateQuizQuestionDto) {
    return this.questions.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('quiz-questions.update')
  @ApiOperation({ summary: 'Update a quiz question (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.questions.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('quiz-questions.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a quiz question (sets deletedAt).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.questions.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('quiz-questions.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted quiz question.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.questions.restore(id);
  }
}
