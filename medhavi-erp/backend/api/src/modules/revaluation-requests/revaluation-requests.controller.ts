import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateRevaluationRequestDto } from './dto/create-revaluation-request.dto';
import { ListRevaluationRequestsQueryDto } from './dto/list-revaluation-requests.query';
import { UpdateRevaluationRequestDto } from './dto/update-revaluation-request.dto';
import { RevaluationRequestsService } from './revaluation-requests.service';

@ApiTags('Revaluation Requests') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'revaluation-requests', version: '1' })
export class RevaluationRequestsController {
  constructor(private readonly service: RevaluationRequestsService) {}
  @Get() @RequirePermissions('revaluation-requests.read') @ApiOperation({ summary: 'List revaluation requests.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListRevaluationRequestsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('revaluation-requests.read') @ApiOperation({ summary: 'Get revaluation request by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('revaluation-requests.create') @ApiOperation({ summary: 'Create revaluation request.' })
  create(@Body() dto: CreateRevaluationRequestDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('revaluation-requests.update') @ApiOperation({ summary: 'Update revaluation request.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateRevaluationRequestDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('revaluation-requests.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete revaluation request.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('revaluation-requests.restore') @ApiOperation({ summary: 'Restore revaluation request.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
