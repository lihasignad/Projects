import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateResultDto } from './dto/create-result.dto';
import { ListResultsQueryDto } from './dto/list-results.query';
import { UpdateResultDto } from './dto/update-result.dto';
import { ResultsService } from './results.service';

@ApiTags('Results') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'results', version: '1' })
export class ResultsController {
  constructor(private readonly service: ResultsService) {}
  @Get() @RequirePermissions('results.read') @ApiOperation({ summary: 'List results.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListResultsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('results.read') @ApiOperation({ summary: 'Get result by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('results.create') @ApiOperation({ summary: 'Create result.' })
  create(@Body() dto: CreateResultDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('results.update') @ApiOperation({ summary: 'Update result.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateResultDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('results.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete result.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('results.restore') @ApiOperation({ summary: 'Restore result.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
