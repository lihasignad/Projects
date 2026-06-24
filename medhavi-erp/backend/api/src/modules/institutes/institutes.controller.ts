import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import type { JwtAccessPayload } from '../auth/token.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { InstituteDto, PaginatedInstitutesDto } from './dto/institute-response.dto';
import { ListInstitutesQueryDto } from './dto/list-institutes.query';
import { UpdateInstituteDto } from './dto/update-institute.dto';
import { InstitutesService } from './institutes.service';

function ctxFrom(req: Request, ip?: string) {
  return {
    ip: ip ?? req.ip ?? null,
    userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
    requestId: (req.headers['x-request-id'] as string | undefined) ?? null,
    traceId: (req.headers['x-trace-id'] as string | undefined) ?? null,
  };
}

@ApiTags('institutes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('institutes')
export class InstitutesController {
  constructor(private readonly service: InstitutesService) {}

  @Get()
  @RequirePermissions('institutes.read')
  @ApiOperation({ summary: 'List institutes (paginated, filterable)' })
  @ApiOkResponse({ type: PaginatedInstitutesDto })
  list(@Query() query: ListInstitutesQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @RequirePermissions('institutes.read')
  @ApiOperation({ summary: 'Get one institute by id' })
  @ApiOkResponse({ type: InstituteDto })
  @ApiNotFoundResponse()
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.service.findOne(id, includeDeleted === 'true');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('institutes.create')
  @ApiOperation({ summary: 'Create a new institute' })
  @ApiCreatedResponse({ type: InstituteDto })
  @ApiConflictResponse({ description: 'code or domain already in use' })
  create(
    @Body() dto: CreateInstituteDto,
    @CurrentUser() user: JwtAccessPayload,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.service.create(dto, user.sub, ctxFrom(req, ip));
  }

  @Patch(':id')
  @RequirePermissions('institutes.update')
  @ApiOperation({ summary: 'Update an institute (partial)' })
  @ApiOkResponse({ type: InstituteDto })
  @ApiNotFoundResponse()
  @ApiConflictResponse({ description: 'code or domain already in use' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateInstituteDto,
    @CurrentUser() user: JwtAccessPayload,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.service.update(id, dto, user.sub, ctxFrom(req, ip));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('institutes.delete')
  @ApiOperation({ summary: 'Soft-delete an institute (sets ARCHIVED)' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtAccessPayload,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.service.remove(id, user.sub, ctxFrom(req, ip));
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('institutes.restore')
  @ApiOperation({ summary: 'Restore a soft-deleted institute (sets ACTIVE)' })
  @ApiOkResponse({ type: InstituteDto })
  @ApiNotFoundResponse()
  restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtAccessPayload,
    @Req() req: Request,
    @Ip() ip: string,
  ) {
    return this.service.restore(id, user.sub, ctxFrom(req, ip));
  }
}
