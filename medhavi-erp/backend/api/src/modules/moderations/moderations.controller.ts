import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateModerationDto } from './dto/create-moderation.dto';
import { ListModerationsQueryDto } from './dto/list-moderations.query';
import { UpdateModerationDto } from './dto/update-moderation.dto';
import { ModerationsService } from './moderations.service';

@ApiTags('Moderations') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'moderations', version: '1' })
export class ModerationsController {
  constructor(private readonly service: ModerationsService) {}
  @Get() @RequirePermissions('moderations.read') @ApiOperation({ summary: 'List moderations.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListModerationsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('moderations.read') @ApiOperation({ summary: 'Get moderation by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('moderations.create') @ApiOperation({ summary: 'Create moderation.' })
  create(@Body() dto: CreateModerationDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('moderations.update') @ApiOperation({ summary: 'Update moderation.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateModerationDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('moderations.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete moderation.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('moderations.restore') @ApiOperation({ summary: 'Restore moderation.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
