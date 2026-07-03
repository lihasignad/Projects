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
import { QuizBanksService } from './quiz-banks.service';
import { CreateQuizBankDto } from './dto/create-quiz-bank.dto';
import { ListQuizBanksQueryDto } from './dto/list-quiz-banks.query';
import { UpdateQuizBankDto } from './dto/update-quiz-bank.dto';

/**
 * QuizBanksController
 *
 * Permission keys mirror the assignment-categories module:
 *   quiz-banks.read   | quiz-banks.create
 *   quiz-banks.update | quiz-banks.delete
 *   quiz-banks.restore
 */
@ApiTags('Quiz Banks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'quiz-banks', version: '1' })
export class QuizBanksController {
  constructor(private readonly quizBanks: QuizBanksService) {}

  @Get()
  @RequirePermissions('quiz-banks.read')
  @ApiOperation({ summary: 'List quiz banks (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of quiz banks.' })
  list(@Query() query: ListQuizBanksQueryDto) {
    return this.quizBanks.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('quiz-banks.read')
  @ApiOperation({ summary: 'Get a single quiz bank by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizBanks.findOne(id);
  }

  @Post()
  @RequirePermissions('quiz-banks.create')
  @ApiOperation({ summary: 'Create a new quiz bank.' })
  create(@Body() dto: CreateQuizBankDto) {
    return this.quizBanks.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('quiz-banks.update')
  @ApiOperation({ summary: 'Update a quiz bank (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateQuizBankDto,
  ) {
    return this.quizBanks.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('quiz-banks.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a quiz bank (sets deletedAt).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizBanks.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('quiz-banks.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted quiz bank.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.quizBanks.restore(id);
  }
}
