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
import { SubjectOfferingsService } from './subject-offerings.service';
import { CreateSubjectOfferingDto } from './dto/create-subject-offering.dto';
import { ListSubjectOfferingsQueryDto } from './dto/list-subject-offerings.query';
import { UpdateSubjectOfferingDto } from './dto/update-subject-offering.dto';

/**
 * SubjectOfferingsController
 *
 * Permission keys mirror the sections module:
 *   subject-offerings.read   | subject-offerings.create | subject-offerings.update
 *   subject-offerings.delete | subject-offerings.restore
 */
@ApiTags('Subject Offerings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'subject-offerings', version: '1' })
export class SubjectOfferingsController {
  constructor(private readonly offerings: SubjectOfferingsService) {}

  @Get()
  @RequirePermissions('subject-offerings.read')
  @ApiOperation({ summary: 'List subject offerings (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of subject offerings.' })
  list(@Query() query: ListSubjectOfferingsQueryDto) {
    return this.offerings.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('subject-offerings.read')
  @ApiOperation({ summary: 'Get a single subject offering by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.offerings.findOne(id);
  }

  @Post()
  @RequirePermissions('subject-offerings.create')
  @ApiOperation({
    summary: 'Create a new subject offering for a term (and optional section).',
  })
  create(@Body() dto: CreateSubjectOfferingDto) {
    return this.offerings.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('subject-offerings.update')
  @ApiOperation({ summary: 'Update a subject offering (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubjectOfferingDto,
  ) {
    return this.offerings.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('subject-offerings.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a subject offering (sets deletedAt).' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.offerings.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('subject-offerings.restore')
  @ApiOperation({
    summary: 'Restore a previously soft-deleted subject offering.',
  })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.offerings.restore(id);
  }
}
