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
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { ListCertificatesQueryDto } from './dto/list-certificates.query';
import { UpdateCertificateDto } from './dto/update-certificate.dto';
import { CertificatesService } from './certificates.service';

@ApiTags('Certificates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'certificates', version: '1' })
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get()
  @RequirePermissions('certificates.read')
  @ApiOperation({ summary: 'List certificates (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of certificates.' })
  list(@Query() query: ListCertificatesQueryDto) {
    return this.certificates.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('certificates.read')
  @ApiOperation({ summary: 'Get a single certificate by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.certificates.findOne(id);
  }

  @Post()
  @RequirePermissions('certificates.create')
  @ApiOperation({ summary: 'Create a new certificate.' })
  create(@Body() dto: CreateCertificateDto) {
    return this.certificates.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('certificates.update')
  @ApiOperation({ summary: 'Update a certificate (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCertificateDto,
  ) {
    return this.certificates.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('certificates.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a certificate.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.certificates.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('certificates.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted certificate.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.certificates.restore(id);
  }
}
