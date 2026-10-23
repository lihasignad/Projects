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
import { CreateClubMembershipDto } from './dto/create-club-membership.dto';
import { ListClubMembershipsQueryDto } from './dto/list-club-memberships.query';
import { UpdateClubMembershipDto } from './dto/update-club-membership.dto';
import { ClubMembershipsService } from './club-memberships.service';

@ApiTags('Club Memberships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'club-memberships', version: '1' })
export class ClubMembershipsController {
  constructor(private readonly clubMemberships: ClubMembershipsService) {}

  @Get()
  @RequirePermissions('club-memberships.read')
  @ApiOperation({ summary: 'List club memberships (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of club memberships.' })
  list(@Query() query: ListClubMembershipsQueryDto) {
    return this.clubMemberships.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('club-memberships.read')
  @ApiOperation({ summary: 'Get a single clubMembership by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clubMemberships.findOne(id);
  }

  @Post()
  @RequirePermissions('club-memberships.create')
  @ApiOperation({ summary: 'Create a new clubMembership.' })
  create(@Body() dto: CreateClubMembershipDto) {
    return this.clubMemberships.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('club-memberships.update')
  @ApiOperation({ summary: 'Update a clubMembership (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClubMembershipDto,
  ) {
    return this.clubMemberships.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('club-memberships.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a clubMembership.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clubMemberships.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('club-memberships.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted clubMembership.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clubMemberships.restore(id);
  }
}
