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
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { ListScholarshipsQueryDto } from './dto/list-scholarships.query';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipsService } from './scholarships.service';

@ApiTags('Scholarships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'scholarships', version: '1' })
export class ScholarshipsController {
  constructor(private readonly scholarships: ScholarshipsService) {}

  @Get()
  @RequirePermissions('scholarships.read')
  @ApiOperation({ summary: 'List scholarships (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of scholarships.' })
  list(@Query() query: ListScholarshipsQueryDto) {
    return this.scholarships.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('scholarships.read')
  @ApiOperation({ summary: 'Get a single scholarship by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.scholarships.findOne(id);
  }

  @Post()
  @RequirePermissions('scholarships.create')
  @ApiOperation({ summary: 'Create a new scholarship.' })
  create(@Body() dto: CreateScholarshipDto) {
    return this.scholarships.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('scholarships.update')
  @ApiOperation({ summary: 'Update a scholarship (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateScholarshipDto,
  ) {
    return this.scholarships.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('scholarships.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a scholarship.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.scholarships.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('scholarships.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted scholarship.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.scholarships.restore(id);
  }
}
