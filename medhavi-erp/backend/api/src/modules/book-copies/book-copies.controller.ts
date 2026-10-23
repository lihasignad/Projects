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
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { ListBookCopiesQueryDto } from './dto/list-book-copies.query';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { BookCopiesService } from './book-copies.service';

@ApiTags('Book Copies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'book-copies', version: '1' })
export class BookCopiesController {
  constructor(private readonly bookCopies: BookCopiesService) {}

  @Get()
  @RequirePermissions('book-copies.read')
  @ApiOperation({ summary: 'List book copies (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of book copies.' })
  list(@Query() query: ListBookCopiesQueryDto) {
    return this.bookCopies.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('book-copies.read')
  @ApiOperation({ summary: 'Get a single bookCopy by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookCopies.findOne(id);
  }

  @Post()
  @RequirePermissions('book-copies.create')
  @ApiOperation({ summary: 'Create a new bookCopy.' })
  create(@Body() dto: CreateBookCopyDto) {
    return this.bookCopies.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('book-copies.update')
  @ApiOperation({ summary: 'Update a bookCopy (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBookCopyDto,
  ) {
    return this.bookCopies.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('book-copies.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a bookCopy.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookCopies.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('book-copies.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted bookCopy.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookCopies.restore(id);
  }
}
