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
import { CreateHostelDto } from './dto/create-hostel.dto';
import { ListHostelsQueryDto } from './dto/list-hostels.query';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { HostelsService } from './hostels.service';

@ApiTags('Hostels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'hostels', version: '1' })
export class HostelsController {
  constructor(private readonly hostels: HostelsService) {}

  @Get()
  @RequirePermissions('hostels.read')
  @ApiOperation({ summary: 'List hostels (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of hostels.' })
  list(@Query() query: ListHostelsQueryDto) {
    return this.hostels.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('hostels.read')
  @ApiOperation({ summary: 'Get a single hostel by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostels.findOne(id);
  }

  @Post()
  @RequirePermissions('hostels.create')
  @ApiOperation({ summary: 'Create a new hostel.' })
  create(@Body() dto: CreateHostelDto) {
    return this.hostels.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('hostels.update')
  @ApiOperation({ summary: 'Update a hostel (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHostelDto,
  ) {
    return this.hostels.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('hostels.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a hostel.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostels.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('hostels.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted hostel.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.hostels.restore(id);
  }
}
