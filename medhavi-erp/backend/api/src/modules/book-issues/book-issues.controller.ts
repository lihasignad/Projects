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
import { CreateBookIssueDto } from './dto/create-book-issue.dto';
import { ListBookIssuesQueryDto } from './dto/list-book-issues.query';
import { UpdateBookIssueDto } from './dto/update-book-issue.dto';
import { BookIssuesService } from './book-issues.service';

@ApiTags('Book Issues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'book-issues', version: '1' })
export class BookIssuesController {
  constructor(private readonly bookIssues: BookIssuesService) {}

  @Get()
  @RequirePermissions('book-issues.read')
  @ApiOperation({ summary: 'List book issues (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of book issues.' })
  list(@Query() query: ListBookIssuesQueryDto) {
    return this.bookIssues.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('book-issues.read')
  @ApiOperation({ summary: 'Get a single bookIssue by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookIssues.findOne(id);
  }

  @Post()
  @RequirePermissions('book-issues.create')
  @ApiOperation({ summary: 'Create a new bookIssue.' })
  create(@Body() dto: CreateBookIssueDto) {
    return this.bookIssues.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('book-issues.update')
  @ApiOperation({ summary: 'Update a bookIssue (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBookIssueDto,
  ) {
    return this.bookIssues.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('book-issues.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a bookIssue.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookIssues.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('book-issues.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted bookIssue.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookIssues.restore(id);
  }
}
