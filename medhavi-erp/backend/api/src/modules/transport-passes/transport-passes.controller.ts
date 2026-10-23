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
import { CreateTransportPassDto } from './dto/create-transport-pass.dto';
import { ListTransportPassesQueryDto } from './dto/list-transport-passes.query';
import { UpdateTransportPassDto } from './dto/update-transport-pass.dto';
import { TransportPassesService } from './transport-passes.service';

@ApiTags('Transport Passes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'transport-passes', version: '1' })
export class TransportPassesController {
  constructor(private readonly transportPasses: TransportPassesService) {}

  @Get()
  @RequirePermissions('transport-passes.read')
  @ApiOperation({ summary: 'List transport passes (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of transport passes.' })
  list(@Query() query: ListTransportPassesQueryDto) {
    return this.transportPasses.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('transport-passes.read')
  @ApiOperation({ summary: 'Get a single transportPass by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportPasses.findOne(id);
  }

  @Post()
  @RequirePermissions('transport-passes.create')
  @ApiOperation({ summary: 'Create a new transportPass.' })
  create(@Body() dto: CreateTransportPassDto) {
    return this.transportPasses.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('transport-passes.update')
  @ApiOperation({ summary: 'Update a transportPass (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTransportPassDto,
  ) {
    return this.transportPasses.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('transport-passes.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a transportPass.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportPasses.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('transport-passes.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted transportPass.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.transportPasses.restore(id);
  }
}
