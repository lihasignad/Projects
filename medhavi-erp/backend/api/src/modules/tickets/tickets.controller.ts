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
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets.query';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'tickets', version: '1' })
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  @RequirePermissions('tickets.read')
  @ApiOperation({ summary: 'List tickets (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of tickets.' })
  list(@Query() query: ListTicketsQueryDto) {
    return this.tickets.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('tickets.read')
  @ApiOperation({ summary: 'Get a single ticket by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tickets.findOne(id);
  }

  @Post()
  @RequirePermissions('tickets.create')
  @ApiOperation({ summary: 'Create a new ticket.' })
  create(@Body() dto: CreateTicketDto) {
    return this.tickets.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('tickets.update')
  @ApiOperation({ summary: 'Update a ticket (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.tickets.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('tickets.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a ticket.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tickets.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('tickets.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted ticket.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tickets.restore(id);
  }
}
