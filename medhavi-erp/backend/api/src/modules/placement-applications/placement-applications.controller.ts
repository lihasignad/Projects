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
import { CreatePlacementApplicationDto } from './dto/create-placement-application.dto';
import { ListPlacementApplicationsQueryDto } from './dto/list-placement-applications.query';
import { UpdatePlacementApplicationDto } from './dto/update-placement-application.dto';
import { PlacementApplicationsService } from './placement-applications.service';

@ApiTags('Placement Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'placement-applications', version: '1' })
export class PlacementApplicationsController {
  constructor(private readonly placementApplications: PlacementApplicationsService) {}

  @Get()
  @RequirePermissions('placement-applications.read')
  @ApiOperation({ summary: 'List placement applications (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of placement applications.' })
  list(@Query() query: ListPlacementApplicationsQueryDto) {
    return this.placementApplications.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('placement-applications.read')
  @ApiOperation({ summary: 'Get a single placementApplication by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementApplications.findOne(id);
  }

  @Post()
  @RequirePermissions('placement-applications.create')
  @ApiOperation({ summary: 'Create a new placementApplication.' })
  create(@Body() dto: CreatePlacementApplicationDto) {
    return this.placementApplications.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('placement-applications.update')
  @ApiOperation({ summary: 'Update a placementApplication (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePlacementApplicationDto,
  ) {
    return this.placementApplications.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('placement-applications.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a placementApplication.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementApplications.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('placement-applications.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted placementApplication.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementApplications.restore(id);
  }
}
