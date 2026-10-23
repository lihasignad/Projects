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
import { CreatePublicationDto } from './dto/create-publication.dto';
import { ListPublicationsQueryDto } from './dto/list-publications.query';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsService } from './publications.service';

@ApiTags('Publications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'publications', version: '1' })
export class PublicationsController {
  constructor(private readonly publications: PublicationsService) {}

  @Get()
  @RequirePermissions('publications.read')
  @ApiOperation({ summary: 'List publications (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of publications.' })
  list(@Query() query: ListPublicationsQueryDto) {
    return this.publications.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('publications.read')
  @ApiOperation({ summary: 'Get a single publication by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.publications.findOne(id);
  }

  @Post()
  @RequirePermissions('publications.create')
  @ApiOperation({ summary: 'Create a new publication.' })
  create(@Body() dto: CreatePublicationDto) {
    return this.publications.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('publications.update')
  @ApiOperation({ summary: 'Update a publication (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePublicationDto,
  ) {
    return this.publications.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('publications.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a publication.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.publications.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('publications.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted publication.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.publications.restore(id);
  }
}
