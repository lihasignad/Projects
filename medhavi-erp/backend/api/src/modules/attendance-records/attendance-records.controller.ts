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
import { AttendanceRecordsService } from './attendance-records.service';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query';
import { UpdateAttendanceRecordDto } from './dto/update-attendance-record.dto';

@ApiTags('Attendance Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'attendance-records', version: '1' })
export class AttendanceRecordsController {
  constructor(private readonly attendanceRecords: AttendanceRecordsService) {}

  @Get()
  @RequirePermissions('attendance-records.read')
  @ApiOperation({ summary: 'List attendance records (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of attendance records.' })
  list(@Query() query: ListAttendanceRecordsQueryDto) {
    return this.attendanceRecords.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('attendance-records.read')
  @ApiOperation({ summary: 'Get a single attendance record by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attendanceRecords.findOne(id);
  }

  @Post()
  @RequirePermissions('attendance-records.create')
  @ApiOperation({ summary: 'Create a new attendance record.' })
  create(@Body() dto: CreateAttendanceRecordDto) {
    return this.attendanceRecords.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('attendance-records.update')
  @ApiOperation({ summary: 'Update an attendance record (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAttendanceRecordDto,
  ) {
    return this.attendanceRecords.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('attendance-records.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an attendance record.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attendanceRecords.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('attendance-records.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted attendance record.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.attendanceRecords.restore(id);
  }
}
