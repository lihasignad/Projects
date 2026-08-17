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
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import { ListTimetableEntriesQueryDto } from './dto/list-timetable-entries.query';
import { UpdateTimetableEntryDto } from './dto/update-timetable-entry.dto';
import { TimetableEntriesService } from './timetable-entries.service';

@ApiTags('Timetable Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'timetable-entries', version: '1' })
export class TimetableEntriesController {
  constructor(private readonly timetableEntries: TimetableEntriesService) {}

  @Get()
  @RequirePermissions('timetable-entries.read')
  @ApiOperation({ summary: 'List timetable entries (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of timetable entries.' })
  list(@Query() query: ListTimetableEntriesQueryDto) {
    return this.timetableEntries.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('timetable-entries.read')
  @ApiOperation({ summary: 'Get a single timetable entry by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timetableEntries.findOne(id);
  }

  @Post()
  @RequirePermissions('timetable-entries.create')
  @ApiOperation({ summary: 'Create a new timetable entry.' })
  create(@Body() dto: CreateTimetableEntryDto) {
    return this.timetableEntries.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('timetable-entries.update')
  @ApiOperation({ summary: 'Update a timetable entry (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTimetableEntryDto,
  ) {
    return this.timetableEntries.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('timetable-entries.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a timetable entry.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timetableEntries.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('timetable-entries.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted timetable entry.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timetableEntries.restore(id);
  }
}
