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
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { ListTimetablesQueryDto } from './dto/list-timetables.query';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { TimetablesService } from './timetables.service';

@ApiTags('Timetables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'timetables', version: '1' })
export class TimetablesController {
  constructor(private readonly timetables: TimetablesService) {}

  @Get()
  @RequirePermissions('timetables.read')
  @ApiOperation({ summary: 'List timetables (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of timetables.' })
  list(@Query() query: ListTimetablesQueryDto) {
    return this.timetables.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('timetables.read')
  @ApiOperation({ summary: 'Get a single timetable by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timetables.findOne(id);
  }

  @Post()
  @RequirePermissions('timetables.create')
  @ApiOperation({ summary: 'Create a new timetable.' })
  create(@Body() dto: CreateTimetableDto) {
    return this.timetables.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('timetables.update')
  @ApiOperation({ summary: 'Update a timetable (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTimetableDto,
  ) {
    return this.timetables.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('timetables.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a timetable.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timetables.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('timetables.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted timetable.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.timetables.restore(id);
  }
}
