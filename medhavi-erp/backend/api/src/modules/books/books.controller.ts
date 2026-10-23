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
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQueryDto } from './dto/list-books.query';
import { UpdateBookDto } from './dto/update-book.dto';
import { BooksService } from './books.service';

@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'books', version: '1' })
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get()
  @RequirePermissions('books.read')
  @ApiOperation({ summary: 'List books (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of books.' })
  list(@Query() query: ListBooksQueryDto) {
    return this.books.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('books.read')
  @ApiOperation({ summary: 'Get a single book by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.books.findOne(id);
  }

  @Post()
  @RequirePermissions('books.create')
  @ApiOperation({ summary: 'Create a new book.' })
  create(@Body() dto: CreateBookDto) {
    return this.books.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('books.update')
  @ApiOperation({ summary: 'Update a book (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.books.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('books.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a book.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.books.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('books.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted book.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.books.restore(id);
  }
}
