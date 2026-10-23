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
import { CreateTransportRouteDto } from './dto/create-transport-route.dto';
import { ListTransportRoutesQueryDto } from './dto/list-transport-routes.query';
import { UpdateTransportRouteDto } from './dto/update-transport-route.dto';
import { TransportRoutesService } from './transport-routes.service';

@ApiTags('Transport Routes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'transport-routes', version: '1' })
export class TransportRoutesController {
  constructor(private readonly transportRoutes: TransportRoutesService) {}

  @Get()
  @RequirePermissions('transport-routes.read')
  @ApiOperation({ summary: 'List transport routes (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of transport routes.' })
  list(@Query() query: ListTransportRoutesQueryDto) {
    return this.transportRoutes.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('transport-routes.read')
  @ApiOperation({ summary: 'Get a single transportRoute by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportRoutes.findOne(id);
  }

  @Post()
  @RequirePermissions('transport-routes.create')
  @ApiOperation({ summary: 'Create a new transportRoute.' })
  create(@Body() dto: CreateTransportRouteDto) {
    return this.transportRoutes.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('transport-routes.update')
  @ApiOperation({ summary: 'Update a transportRoute (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTransportRouteDto,
  ) {
    return this.transportRoutes.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('transport-routes.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a transportRoute.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportRoutes.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('transport-routes.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted transportRoute.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportRoutes.restore(id);
  }
}
