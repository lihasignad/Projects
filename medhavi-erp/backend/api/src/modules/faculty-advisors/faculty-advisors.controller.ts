import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateFacultyAdvisorDto } from './dto/create-faculty-advisor.dto';
import { ListFacultyAdvisorsQueryDto } from './dto/list-faculty-advisors.query';
import { UpdateFacultyAdvisorDto } from './dto/update-faculty-advisor.dto';
import { FacultyAdvisorsService } from './faculty-advisors.service';

@ApiTags('Faculty Advisors') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'faculty-advisors', version: '1' })
export class FacultyAdvisorsController {
  constructor(private readonly service: FacultyAdvisorsService) {}
  @Get() @RequirePermissions('faculty-advisors.read') @ApiOperation({ summary: 'List faculty advisors.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListFacultyAdvisorsQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('faculty-advisors.read') @ApiOperation({ summary: 'Get faculty advisor by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('faculty-advisors.create') @ApiOperation({ summary: 'Create faculty advisor.' })
  create(@Body() dto: CreateFacultyAdvisorDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('faculty-advisors.update') @ApiOperation({ summary: 'Update faculty advisor.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateFacultyAdvisorDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('faculty-advisors.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete faculty advisor.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('faculty-advisors.restore') @ApiOperation({ summary: 'Restore faculty advisor.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
