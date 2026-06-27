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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * UsersController
 *
 * Permission keys mirror the programs module:
 *   users.read   | users.create | users.update
 *   users.delete | users.restore
 */
@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List users (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of users.' })
  list(@Query() query: ListUsersQueryDto) {
    return this.users.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get a single user by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({
    summary:
      'Create a new user identity (no password / credential is created).',
  })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Update a user (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete a user (sets deletedAt, status=DEACTIVATED).',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('users.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted user.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.restore(id);
  }
}
