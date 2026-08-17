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
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { ListTimeSlotsQueryDto } from './dto/list-time-slots.query';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { TimeSlotsService } from './time-slots.service';

@ApiTags('Time Slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'time-slots', version: '1' })
export class TimeSlotsController {
  constructor(private readonly timeSlots: TimeSlotsService) {}

  @Get()
  @RequirePermissions('time-slots.read')
  @ApiOperation({ summary: 'List time slots (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of time slots.' })
  list(@Query() query: ListTimeSlotsQueryDto) {
    return this.timeSlots.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('time-slots.read')
  @ApiOperation({ summary: 'Get a single time slot by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timeSlots.findOne(id);
  }

  @Post()
  @RequirePermissions('time-slots.create')
  @ApiOperation({ summary: 'Create a new time slot.' })
  create(@Body() dto: CreateTimeSlotDto) {
    return this.timeSlots.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('time-slots.update')
  @ApiOperation({ summary: 'Update a time slot (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTimeSlotDto,
  ) {
    return this.timeSlots.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('time-slots.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a time slot.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timeSlots.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('time-slots.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted time slot.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timeSlots.restore(id);
  }
}
