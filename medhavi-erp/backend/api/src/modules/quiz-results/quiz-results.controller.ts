import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateQuizResultDto } from './dto/create-quiz-result.dto';
import { ListQuizResultsQueryDto } from './dto/list-quiz-results.query';
import { UpdateQuizResultDto } from './dto/update-quiz-result.dto';
import { QuizResultsService } from './quiz-results.service';

@ApiTags('Quiz Results') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'quiz-results', version: '1' })
export class QuizResultsController {
  constructor(private readonly service: QuizResultsService) {}
  @Get() @RequirePermissions('quiz-results.read') @ApiOperation({ summary: 'List quiz results.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListQuizResultsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('quiz-results.read') @ApiOperation({ summary: 'Get quiz result by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('quiz-results.create') @ApiOperation({ summary: 'Create quiz result.' })
  create(@Body() dto: CreateQuizResultDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('quiz-results.update') @ApiOperation({ summary: 'Update quiz result.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateQuizResultDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('quiz-results.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete quiz result.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('quiz-results.restore') @ApiOperation({ summary: 'Restore quiz result.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
