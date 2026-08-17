import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { ListTranscriptsQueryDto } from './dto/list-transcripts.query';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { TranscriptsService } from './transcripts.service';

@ApiTags('Transcripts') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'transcripts', version: '1' })
export class TranscriptsController {
  constructor(private readonly service: TranscriptsService) {}
  @Get() @RequirePermissions('transcripts.read') @ApiOperation({ summary: 'List transcripts.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListTranscriptsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('transcripts.read') @ApiOperation({ summary: 'Get transcript by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('transcripts.create') @ApiOperation({ summary: 'Create transcript.' })
  create(@Body() dto: CreateTranscriptDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('transcripts.update') @ApiOperation({ summary: 'Update transcript.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateTranscriptDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('transcripts.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete transcript.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('transcripts.restore') @ApiOperation({ summary: 'Restore transcript.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
