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
import { CreateResearchProjectDto } from './dto/create-research-project.dto';
import { ListResearchProjectsQueryDto } from './dto/list-research-projects.query';
import { UpdateResearchProjectDto } from './dto/update-research-project.dto';
import { ResearchProjectsService } from './research-projects.service';

@ApiTags('Research Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'research-projects', version: '1' })
export class ResearchProjectsController {
  constructor(private readonly researchProjects: ResearchProjectsService) {}

  @Get()
  @RequirePermissions('research-projects.read')
  @ApiOperation({ summary: 'List research projects (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of research projects.' })
  list(@Query() query: ListResearchProjectsQueryDto) {
    return this.researchProjects.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('research-projects.read')
  @ApiOperation({ summary: 'Get a single researchProject by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.researchProjects.findOne(id);
  }

  @Post()
  @RequirePermissions('research-projects.create')
  @ApiOperation({ summary: 'Create a new researchProject.' })
  create(@Body() dto: CreateResearchProjectDto) {
    return this.researchProjects.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('research-projects.update')
  @ApiOperation({ summary: 'Update a researchProject (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateResearchProjectDto,
  ) {
    return this.researchProjects.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('research-projects.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a researchProject.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.researchProjects.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('research-projects.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted researchProject.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.researchProjects.restore(id);
  }
}
