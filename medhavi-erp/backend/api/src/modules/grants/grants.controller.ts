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
import { CreateGrantDto } from './dto/create-grant.dto';
import { ListGrantsQueryDto } from './dto/list-grants.query';
import { UpdateGrantDto } from './dto/update-grant.dto';
import { GrantsService } from './grants.service';

@ApiTags('Grants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'grants', version: '1' })
export class GrantsController {
  constructor(private readonly grants: GrantsService) {}

  @Get()
  @RequirePermissions('grants.read')
  @ApiOperation({ summary: 'List grants (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of grants.' })
  list(@Query() query: ListGrantsQueryDto) {
    return this.grants.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('grants.read')
  @ApiOperation({ summary: 'Get a single grant by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.grants.findOne(id);
  }

  @Post()
  @RequirePermissions('grants.create')
  @ApiOperation({ summary: 'Create a new grant.' })
  create(@Body() dto: CreateGrantDto) {
    return this.grants.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('grants.update')
  @ApiOperation({ summary: 'Update a grant (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGrantDto,
  ) {
    return this.grants.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('grants.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a grant.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.grants.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('grants.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted grant.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.grants.restore(id);
  }
}
