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
import { CreatePatentDto } from './dto/create-patent.dto';
import { ListPatentsQueryDto } from './dto/list-patents.query';
import { UpdatePatentDto } from './dto/update-patent.dto';
import { PatentsService } from './patents.service';

@ApiTags('Patents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'patents', version: '1' })
export class PatentsController {
  constructor(private readonly patents: PatentsService) {}

  @Get()
  @RequirePermissions('patents.read')
  @ApiOperation({ summary: 'List patents (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of patents.' })
  list(@Query() query: ListPatentsQueryDto) {
    return this.patents.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('patents.read')
  @ApiOperation({ summary: 'Get a single patent by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.patents.findOne(id);
  }

  @Post()
  @RequirePermissions('patents.create')
  @ApiOperation({ summary: 'Create a new patent.' })
  create(@Body() dto: CreatePatentDto) {
    return this.patents.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('patents.update')
  @ApiOperation({ summary: 'Update a patent (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePatentDto,
  ) {
    return this.patents.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('patents.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a patent.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.patents.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('patents.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted patent.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.patents.restore(id);
  }
}
