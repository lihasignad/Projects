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
import { ClassSessionsService } from './class-sessions.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { ListClassSessionsQueryDto } from './dto/list-class-sessions.query';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

@ApiTags('Class Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'class-sessions', version: '1' })
export class ClassSessionsController {
  constructor(private readonly classSessions: ClassSessionsService) {}

  @Get()
  @RequirePermissions('class-sessions.read')
  @ApiOperation({ summary: 'List class sessions (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of class sessions.' })
  list(@Query() query: ListClassSessionsQueryDto) {
    return this.classSessions.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('class-sessions.read')
  @ApiOperation({ summary: 'Get a single class session by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classSessions.findOne(id);
  }

  @Post()
  @RequirePermissions('class-sessions.create')
  @ApiOperation({ summary: 'Create a new class session.' })
  create(@Body() dto: CreateClassSessionDto) {
    return this.classSessions.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('class-sessions.update')
  @ApiOperation({ summary: 'Update a class session (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassSessionDto,
  ) {
    return this.classSessions.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('class-sessions.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a class session.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classSessions.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('class-sessions.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted class session.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classSessions.restore(id);
  }
}
