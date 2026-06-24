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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ListSchoolsQueryDto } from './dto/list-schools.query';
import { UpdateSchoolDto } from './dto/update-school.dto';

/**
 * SchoolsController
 *
 * Permission keys mirror the campuses module:
 *   schools.read | schools.create | schools.update
 *   schools.delete | schools.restore
 */
@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'schools', version: '1' })
export class SchoolsController {
  constructor(private readonly schools: SchoolsService) {}

  @Get()
  @RequirePermissions('schools.read')
  @ApiOperation({ summary: 'List schools (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of schools.' })
  list(@Query() query: ListSchoolsQueryDto) {
    return this.schools.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('schools.read')
  @ApiOperation({ summary: 'Get a single school by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.schools.findOne(id);
  }

  @Post()
  @RequirePermissions('schools.create')
  @ApiOperation({ summary: 'Create a new school under a campus.' })
  create(@Body() dto: CreateSchoolDto) {
    return this.schools.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('schools.update')
  @ApiOperation({ summary: 'Update a school (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSchoolDto,
  ) {
    return this.schools.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('schools.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a school (sets deletedAt, status=ARCHIVED).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.schools.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('schools.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted school.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.schools.restore(id);
  }
}
