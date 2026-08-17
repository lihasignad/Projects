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
import { AttendanceSessionsService } from './attendance-sessions.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { ListAttendanceSessionsQueryDto } from './dto/list-attendance-sessions.query';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';

@ApiTags('Attendance Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'attendance-sessions', version: '1' })
export class AttendanceSessionsController {
  constructor(private readonly attendanceSessions: AttendanceSessionsService) {}

  @Get()
  @RequirePermissions('attendance-sessions.read')
  @ApiOperation({ summary: 'List attendance sessions (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of attendance sessions.' })
  list(@Query() query: ListAttendanceSessionsQueryDto) {
    return this.attendanceSessions.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('attendance-sessions.read')
  @ApiOperation({ summary: 'Get a single attendance session by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attendanceSessions.findOne(id);
  }

  @Post()
  @RequirePermissions('attendance-sessions.create')
  @ApiOperation({ summary: 'Create a new attendance session.' })
  create(@Body() dto: CreateAttendanceSessionDto) {
    return this.attendanceSessions.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('attendance-sessions.update')
  @ApiOperation({ summary: 'Update an attendance session (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAttendanceSessionDto,
  ) {
    return this.attendanceSessions.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('attendance-sessions.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an attendance session.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attendanceSessions.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('attendance-sessions.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted attendance session.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attendanceSessions.restore(id);
  }
}
