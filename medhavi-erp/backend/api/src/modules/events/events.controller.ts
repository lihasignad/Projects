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
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsQueryDto } from './dto/list-events.query';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @RequirePermissions('events.read')
  @ApiOperation({ summary: 'List events (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of events.' })
  list(@Query() query: ListEventsQueryDto) {
    return this.events.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('events.read')
  @ApiOperation({ summary: 'Get a single event by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.events.findOne(id);
  }

  @Post()
  @RequirePermissions('events.create')
  @ApiOperation({ summary: 'Create a new event.' })
  create(@Body() dto: CreateEventDto) {
    return this.events.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('events.update')
  @ApiOperation({ summary: 'Update a event (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.events.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('events.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a event.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.events.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('events.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted event.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.events.restore(id);
  }
}
