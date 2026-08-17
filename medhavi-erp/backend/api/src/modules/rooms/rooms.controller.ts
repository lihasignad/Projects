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
import { CreateRoomDto } from './dto/create-room.dto';
import { ListRoomsQueryDto } from './dto/list-rooms.query';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'rooms', version: '1' })
export class RoomsController {
  constructor(private readonly rooms: RoomsService) {}

  @Get()
  @RequirePermissions('rooms.read')
  @ApiOperation({ summary: 'List rooms (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of rooms.' })
  list(@Query() query: ListRoomsQueryDto) {
    return this.rooms.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('rooms.read')
  @ApiOperation({ summary: 'Get a single room by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rooms.findOne(id);
  }

  @Post()
  @RequirePermissions('rooms.create')
  @ApiOperation({ summary: 'Create a new room.' })
  create(@Body() dto: CreateRoomDto) {
    return this.rooms.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('rooms.update')
  @ApiOperation({ summary: 'Update a room (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.rooms.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('rooms.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a room.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rooms.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('rooms.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted room.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.rooms.restore(id);
  }
}
