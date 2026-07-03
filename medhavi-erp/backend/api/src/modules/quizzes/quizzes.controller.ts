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
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { ListQuizzesQueryDto } from './dto/list-quizzes.query';
import { UpdateQuizDto } from './dto/update-quiz.dto';

/**
 * QuizzesController
 *
 * Permission keys mirror the quiz-questions module:
 *   quizzes.read    | quizzes.create
 *   quizzes.update  | quizzes.delete
 *   quizzes.restore
 */
@ApiTags('Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'quizzes', version: '1' })
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get()
  @RequirePermissions('quizzes.read')
  @ApiOperation({ summary: 'List quizzes (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of quizzes.' })
  list(@Query() query: ListQuizzesQueryDto) {
    return this.quizzes.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('quizzes.read')
  @ApiOperation({ summary: 'Get a single quiz by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizzes.findOne(id);
  }

  @Post()
  @RequirePermissions('quizzes.create')
  @ApiOperation({ summary: 'Create a new quiz.' })
  create(@Body() dto: CreateQuizDto) {
    return this.quizzes.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('quizzes.update')
  @ApiOperation({ summary: 'Update a quiz (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzes.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('quizzes.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a quiz (sets deletedAt).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizzes.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('quizzes.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted quiz.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizzes.restore(id);
  }
}
