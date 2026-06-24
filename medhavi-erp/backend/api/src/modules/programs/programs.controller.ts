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
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { ListProgramsQueryDto } from './dto/list-programs.query';
import { UpdateProgramDto } from './dto/update-program.dto';

/**
 * ProgramsController
 *
 * Permission keys mirror the departments module:
 *   programs.read   | programs.create | programs.update
 *   programs.delete | programs.restore
 */
@ApiTags('Programs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'programs', version: '1' })
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get()
  @RequirePermissions('programs.read')
  @ApiOperation({ summary: 'List programs (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of programs.' })
  list(@Query() query: ListProgramsQueryDto) {
    return this.programs.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('programs.read')
  @ApiOperation({ summary: 'Get a single program by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programs.findOne(id);
  }

  @Post()
  @RequirePermissions('programs.create')
  @ApiOperation({ summary: 'Create a new program under a department.' })
  create(@Body() dto: CreateProgramDto) {
    return this.programs.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('programs.update')
  @ApiOperation({ summary: 'Update a program (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programs.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('programs.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a program (sets deletedAt, status=RETIRED).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programs.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('programs.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted program.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.programs.restore(id);
  }
}
