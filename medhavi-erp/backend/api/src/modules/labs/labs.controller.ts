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
import { CreateLabDto } from './dto/create-lab.dto';
import { ListLabsQueryDto } from './dto/list-labs.query';
import { UpdateLabDto } from './dto/update-lab.dto';
import { LabsService } from './labs.service';

@ApiTags('Labs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'labs', version: '1' })
export class LabsController {
  constructor(private readonly labs: LabsService) {}

  @Get()
  @RequirePermissions('labs.read')
  @ApiOperation({ summary: 'List labs (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of labs.' })
  list(@Query() query: ListLabsQueryDto) {
    return this.labs.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('labs.read')
  @ApiOperation({ summary: 'Get a single lab by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.labs.findOne(id);
  }

  @Post()
  @RequirePermissions('labs.create')
  @ApiOperation({ summary: 'Create a new lab.' })
  create(@Body() dto: CreateLabDto) {
    return this.labs.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('labs.update')
  @ApiOperation({ summary: 'Update a lab (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLabDto,
  ) {
    return this.labs.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('labs.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a lab.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.labs.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('labs.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted lab.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.labs.restore(id);
  }
}
