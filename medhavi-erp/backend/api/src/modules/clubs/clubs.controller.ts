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
import { CreateClubDto } from './dto/create-club.dto';
import { ListClubsQueryDto } from './dto/list-clubs.query';
import { UpdateClubDto } from './dto/update-club.dto';
import { ClubsService } from './clubs.service';

@ApiTags('Clubs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'clubs', version: '1' })
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  @RequirePermissions('clubs.read')
  @ApiOperation({ summary: 'List clubs (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of clubs.' })
  list(@Query() query: ListClubsQueryDto) {
    return this.clubs.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('clubs.read')
  @ApiOperation({ summary: 'Get a single club by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clubs.findOne(id);
  }

  @Post()
  @RequirePermissions('clubs.create')
  @ApiOperation({ summary: 'Create a new club.' })
  create(@Body() dto: CreateClubDto) {
    return this.clubs.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('clubs.update')
  @ApiOperation({ summary: 'Update a club (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.clubs.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('clubs.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a club.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clubs.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('clubs.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted club.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clubs.restore(id);
  }
}
