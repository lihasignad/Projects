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
import { CreatePlacementDriveDto } from './dto/create-placement-drive.dto';
import { ListPlacementDrivesQueryDto } from './dto/list-placement-drives.query';
import { UpdatePlacementDriveDto } from './dto/update-placement-drive.dto';
import { PlacementDrivesService } from './placement-drives.service';

@ApiTags('Placement Drives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'placement-drives', version: '1' })
export class PlacementDrivesController {
  constructor(private readonly placementDrives: PlacementDrivesService) {}

  @Get()
  @RequirePermissions('placement-drives.read')
  @ApiOperation({ summary: 'List placement drives (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of placement drives.' })
  list(@Query() query: ListPlacementDrivesQueryDto) {
    return this.placementDrives.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('placement-drives.read')
  @ApiOperation({ summary: 'Get a single placementDrive by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementDrives.findOne(id);
  }

  @Post()
  @RequirePermissions('placement-drives.create')
  @ApiOperation({ summary: 'Create a new placementDrive.' })
  create(@Body() dto: CreatePlacementDriveDto) {
    return this.placementDrives.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('placement-drives.update')
  @ApiOperation({ summary: 'Update a placementDrive (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePlacementDriveDto,
  ) {
    return this.placementDrives.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('placement-drives.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a placementDrive.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementDrives.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('placement-drives.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted placementDrive.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementDrives.restore(id);
  }
}
