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
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { ListAcademicYearsQueryDto } from './dto/list-academic-years.query';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';

/**
 * AcademicYearsController
 *
 * Permission keys mirror the programs module:
 *   academic-years.read   | academic-years.create | academic-years.update
 *   academic-years.delete | academic-years.restore
 */
@ApiTags('AcademicYears')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'academic-years', version: '1' })
export class AcademicYearsController {
  constructor(private readonly academicYears: AcademicYearsService) {}

  @Get()
  @RequirePermissions('academic-years.read')
  @ApiOperation({ summary: 'List academic years (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of academic years.' })
  list(@Query() query: ListAcademicYearsQueryDto) {
    return this.academicYears.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('academic-years.read')
  @ApiOperation({ summary: 'Get a single academic year by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.academicYears.findOne(id);
  }

  @Post()
  @RequirePermissions('academic-years.create')
  @ApiOperation({ summary: 'Create a new academic year under an institute.' })
  create(@Body() dto: CreateAcademicYearDto) {
    return this.academicYears.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('academic-years.update')
  @ApiOperation({ summary: 'Update an academic year (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYears.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('academic-years.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Soft-delete an academic year (sets deletedAt, status=ARCHIVED, isCurrent=false).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.academicYears.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('academic-years.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted academic year.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.academicYears.restore(id);
  }
}
