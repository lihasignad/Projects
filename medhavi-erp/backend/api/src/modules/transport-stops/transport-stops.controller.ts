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
import { CreateTransportStopDto } from './dto/create-transport-stop.dto';
import { ListTransportStopsQueryDto } from './dto/list-transport-stops.query';
import { UpdateTransportStopDto } from './dto/update-transport-stop.dto';
import { TransportStopsService } from './transport-stops.service';

@ApiTags('Transport Stops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'transport-stops', version: '1' })
export class TransportStopsController {
  constructor(private readonly transportStops: TransportStopsService) {}

  @Get()
  @RequirePermissions('transport-stops.read')
  @ApiOperation({ summary: 'List transport stops (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of transport stops.' })
  list(@Query() query: ListTransportStopsQueryDto) {
    return this.transportStops.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('transport-stops.read')
  @ApiOperation({ summary: 'Get a single transportStop by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportStops.findOne(id);
  }

  @Post()
  @RequirePermissions('transport-stops.create')
  @ApiOperation({ summary: 'Create a new transportStop.' })
  create(@Body() dto: CreateTransportStopDto) {
    return this.transportStops.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('transport-stops.update')
  @ApiOperation({ summary: 'Update a transportStop (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTransportStopDto,
  ) {
    return this.transportStops.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('transport-stops.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a transportStop.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportStops.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('transport-stops.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted transportStop.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportStops.restore(id);
  }
}
