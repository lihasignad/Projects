import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateRegistrationCycleDto } from './dto/create-registration-cycle.dto';
import { ListRegistrationCyclesQueryDto } from './dto/list-registration-cycles.query';
import { UpdateRegistrationCycleDto } from './dto/update-registration-cycle.dto';
import { RegistrationCyclesService } from './registration-cycles.service';

@ApiTags('Registration Cycles') @ApiBearerAuth() @UseGuards(JwtAuthGuard, PermissionsGuard) @Controller({ path: 'registration-cycles', version: '1' })
export class RegistrationCyclesController {
  constructor(private readonly service: RegistrationCyclesService) {}
  @Get() @RequirePermissions('registration-cycles.read') @ApiOperation({ summary: 'List registration cycles.' }) @ApiOkResponse({ description: 'Paginated list.' })
  list(@Query() query: ListRegistrationCyclesQueryDto) { return this.service.findAll(query); }
  @Get(':id') @RequirePermissions('registration-cycles.read') @ApiOperation({ summary: 'Get registration cycle by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.findOne(id); }
  @Post() @RequirePermissions('registration-cycles.create') @ApiOperation({ summary: 'Create registration cycle.' })
  create(@Body() dto: CreateRegistrationCycleDto) { return this.service.create(dto); }
  @Patch(':id') @RequirePermissions('registration-cycles.update') @ApiOperation({ summary: 'Update registration cycle.' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateRegistrationCycleDto) { return this.service.update(id, dto); }
  @Delete(':id') @RequirePermissions('registration-cycles.delete') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Soft-delete registration cycle.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
  @Post(':id/restore') @RequirePermissions('registration-cycles.restore') @ApiOperation({ summary: 'Restore registration cycle.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.restore(id); }
}
