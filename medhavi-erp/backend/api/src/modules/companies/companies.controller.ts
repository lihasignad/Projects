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
import { CreateCompanyDto } from './dto/create-company.dto';
import { ListCompaniesQueryDto } from './dto/list-companies.query';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Get()
  @RequirePermissions('companies.read')
  @ApiOperation({ summary: 'List companies (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of companies.' })
  list(@Query() query: ListCompaniesQueryDto) {
    return this.companies.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('companies.read')
  @ApiOperation({ summary: 'Get a single company by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companies.findOne(id);
  }

  @Post()
  @RequirePermissions('companies.create')
  @ApiOperation({ summary: 'Create a new company.' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companies.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('companies.update')
  @ApiOperation({ summary: 'Update a company (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companies.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('companies.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a company.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companies.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('companies.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted company.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.companies.restore(id);
  }
}
