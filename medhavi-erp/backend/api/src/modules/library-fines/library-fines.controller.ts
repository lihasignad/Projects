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
import { CreateLibraryFineDto } from './dto/create-library-fine.dto';
import { ListLibraryFinesQueryDto } from './dto/list-library-fines.query';
import { UpdateLibraryFineDto } from './dto/update-library-fine.dto';
import { LibraryFinesService } from './library-fines.service';

@ApiTags('Library Fines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'library-fines', version: '1' })
export class LibraryFinesController {
  constructor(private readonly libraryFines: LibraryFinesService) {}

  @Get()
  @RequirePermissions('library-fines.read')
  @ApiOperation({ summary: 'List library fines (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of library fines.' })
  list(@Query() query: ListLibraryFinesQueryDto) {
    return this.libraryFines.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('library-fines.read')
  @ApiOperation({ summary: 'Get a single libraryFine by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.libraryFines.findOne(id);
  }

  @Post()
  @RequirePermissions('library-fines.create')
  @ApiOperation({ summary: 'Create a new libraryFine.' })
  create(@Body() dto: CreateLibraryFineDto) {
    return this.libraryFines.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('library-fines.update')
  @ApiOperation({ summary: 'Update a libraryFine (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLibraryFineDto,
  ) {
    return this.libraryFines.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('library-fines.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a libraryFine.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.libraryFines.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('library-fines.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted libraryFine.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.libraryFines.restore(id);
  }
}
