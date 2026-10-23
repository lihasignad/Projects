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
import { CreateTransportVehicleDto } from './dto/create-transport-vehicle.dto';
import { ListTransportVehiclesQueryDto } from './dto/list-transport-vehicles.query';
import { UpdateTransportVehicleDto } from './dto/update-transport-vehicle.dto';
import { TransportVehiclesService } from './transport-vehicles.service';

@ApiTags('Transport Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'transport-vehicles', version: '1' })
export class TransportVehiclesController {
  constructor(private readonly transportVehicles: TransportVehiclesService) {}

  @Get()
  @RequirePermissions('transport-vehicles.read')
  @ApiOperation({ summary: 'List transport vehicles (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of transport vehicles.' })
  list(@Query() query: ListTransportVehiclesQueryDto) {
    return this.transportVehicles.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('transport-vehicles.read')
  @ApiOperation({ summary: 'Get a single transportVehicle by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportVehicles.findOne(id);
  }

  @Post()
  @RequirePermissions('transport-vehicles.create')
  @ApiOperation({ summary: 'Create a new transportVehicle.' })
  create(@Body() dto: CreateTransportVehicleDto) {
    return this.transportVehicles.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('transport-vehicles.update')
  @ApiOperation({ summary: 'Update a transportVehicle (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTransportVehicleDto,
  ) {
    return this.transportVehicles.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('transport-vehicles.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a transportVehicle.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportVehicles.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('transport-vehicles.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted transportVehicle.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportVehicles.restore(id);
  }
}
