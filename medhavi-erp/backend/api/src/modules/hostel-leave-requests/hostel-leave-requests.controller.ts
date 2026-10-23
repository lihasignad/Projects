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
import { CreateHostelLeaveRequestDto } from './dto/create-hostel-leave-request.dto';
import { ListHostelLeaveRequestsQueryDto } from './dto/list-hostel-leave-requests.query';
import { UpdateHostelLeaveRequestDto } from './dto/update-hostel-leave-request.dto';
import { HostelLeaveRequestsService } from './hostel-leave-requests.service';

@ApiTags('Hostel Leave Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'hostel-leave-requests', version: '1' })
export class HostelLeaveRequestsController {
  constructor(private readonly hostelLeaveRequests: HostelLeaveRequestsService) {}

  @Get()
  @RequirePermissions('hostel-leave-requests.read')
  @ApiOperation({ summary: 'List hostel leave requests (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of hostel leave requests.' })
  list(@Query() query: ListHostelLeaveRequestsQueryDto) {
    return this.hostelLeaveRequests.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hostel-leave-requests.read')
  @ApiOperation({ summary: 'Get a single hostelLeaveRequest by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelLeaveRequests.findOne(id);
  }

  @Post()
  @RequirePermissions('hostel-leave-requests.create')
  @ApiOperation({ summary: 'Create a new hostelLeaveRequest.' })
  create(@Body() dto: CreateHostelLeaveRequestDto) {
    return this.hostelLeaveRequests.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('hostel-leave-requests.update')
  @ApiOperation({ summary: 'Update a hostelLeaveRequest (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHostelLeaveRequestDto,
  ) {
    return this.hostelLeaveRequests.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('hostel-leave-requests.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a hostelLeaveRequest.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelLeaveRequests.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('hostel-leave-requests.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted hostelLeaveRequest.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelLeaveRequests.restore(id);
  }
}
