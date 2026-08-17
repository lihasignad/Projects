import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateHallTicketDto } from './dto/create-hall-ticket.dto';
import { ListHallTicketsQueryDto } from './dto/list-hall-tickets.query';
import { UpdateHallTicketDto } from './dto/update-hall-ticket.dto';
import { HallTicketsService } from './hall-tickets.service';

@ApiTags('Hall Tickets') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'hall-tickets', version: '1' })
export class HallTicketsController {
  constructor(private readonly service: HallTicketsService) {}
  @Get() @RequirePermissions('hall-tickets.read') @ApiOperation({ summary: 'List hall tickets.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListHallTicketsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('hall-tickets.read') @ApiOperation({ summary: 'Get hall ticket by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('hall-tickets.create') @ApiOperation({ summary: 'Create hall ticket.' })
  create(@Body() dto: CreateHallTicketDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('hall-tickets.update') @ApiOperation({ summary: 'Update hall ticket.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateHallTicketDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('hall-tickets.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete hall ticket.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('hall-tickets.restore') @ApiOperation({ summary: 'Restore hall ticket.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
