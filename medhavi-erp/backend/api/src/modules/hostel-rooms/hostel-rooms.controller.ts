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
import { CreateHostelRoomDto } from './dto/create-hostel-room.dto';
import { ListHostelRoomsQueryDto } from './dto/list-hostel-rooms.query';
import { UpdateHostelRoomDto } from './dto/update-hostel-room.dto';
import { HostelRoomsService } from './hostel-rooms.service';

@ApiTags('Hostel Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'hostel-rooms', version: '1' })
export class HostelRoomsController {
  constructor(private readonly hostelRooms: HostelRoomsService) {}

  @Get()
  @RequirePermissions('hostel-rooms.read')
  @ApiOperation({ summary: 'List hostel rooms (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of hostel rooms.' })
  list(@Query() query: ListHostelRoomsQueryDto) {
    return this.hostelRooms.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hostel-rooms.read')
  @ApiOperation({ summary: 'Get a single hostelRoom by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelRooms.findOne(id);
  }

  @Post()
  @RequirePermissions('hostel-rooms.create')
  @ApiOperation({ summary: 'Create a new hostelRoom.' })
  create(@Body() dto: CreateHostelRoomDto) {
    return this.hostelRooms.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('hostel-rooms.update')
  @ApiOperation({ summary: 'Update a hostelRoom (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHostelRoomDto,
  ) {
    return this.hostelRooms.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('hostel-rooms.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a hostelRoom.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelRooms.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('hostel-rooms.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted hostelRoom.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostelRooms.restore(id);
  }
}
