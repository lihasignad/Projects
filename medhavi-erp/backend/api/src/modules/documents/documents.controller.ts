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
import { CreateDocumentDto } from './dto/create-document.dto';
import { ListDocumentsQueryDto } from './dto/list-documents.query';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'documents', version: '1' })
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  @RequirePermissions('documents.read')
  @ApiOperation({ summary: 'List documents (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of documents.' })
  list(@Query() query: ListDocumentsQueryDto) {
    return this.documents.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('documents.read')
  @ApiOperation({ summary: 'Get a single document by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.findOne(id);
  }

  @Post()
  @RequirePermissions('documents.create')
  @ApiOperation({ summary: 'Create a new document.' })
  create(@Body() dto: CreateDocumentDto) {
    return this.documents.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('documents.update')
  @ApiOperation({ summary: 'Update a document (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documents.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('documents.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a document.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('documents.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted document.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.documents.restore(id);
  }
}
