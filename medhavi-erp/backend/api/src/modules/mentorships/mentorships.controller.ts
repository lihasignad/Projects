import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateMentorshipDto } from './dto/create-mentorship.dto';
import { ListMentorshipsQueryDto } from './dto/list-mentorships.query';
import { UpdateMentorshipDto } from './dto/update-mentorship.dto';
import { MentorshipsService } from './mentorships.service';

@ApiTags('Mentorships') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'mentorships', version: '1' })
export class MentorshipsController {
  constructor(private readonly service: MentorshipsService) {}
  @Get() @RequirePermissions('mentorships.read') @ApiOperation({ summary: 'List mentorships.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListMentorshipsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('mentorships.read') @ApiOperation({ summary: 'Get mentorship by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('mentorships.create') @ApiOperation({ summary: 'Create mentorship.' })
  create(@Body() dto: CreateMentorshipDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('mentorships.update') @ApiOperation({ summary: 'Update mentorship.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateMentorshipDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('mentorships.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete mentorship.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('mentorships.restore') @ApiOperation({ summary: 'Restore mentorship.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
