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
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { ListEventRegistrationsQueryDto } from './dto/list-event-registrations.query';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';
import { EventRegistrationsService } from './event-registrations.service';

@ApiTags('Event Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'event-registrations', version: '1' })
export class EventRegistrationsController {
  constructor(private readonly eventRegistrations: EventRegistrationsService) {}

  @Get()
  @RequirePermissions('event-registrations.read')
  @ApiOperation({ summary: 'List event registrations (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of event registrations.' })
  list(@Query() query: ListEventRegistrationsQueryDto) {
    return this.eventRegistrations.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('event-registrations.read')
  @ApiOperation({ summary: 'Get a single eventRegistration by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventRegistrations.findOne(id);
  }

  @Post()
  @RequirePermissions('event-registrations.create')
  @ApiOperation({ summary: 'Create a new eventRegistration.' })
  create(@Body() dto: CreateEventRegistrationDto) {
    return this.eventRegistrations.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('event-registrations.update')
  @ApiOperation({ summary: 'Update a eventRegistration (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateEventRegistrationDto,
  ) {
    return this.eventRegistrations.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('event-registrations.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a eventRegistration.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventRegistrations.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('event-registrations.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted eventRegistration.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.eventRegistrations.restore(id);
  }
}
