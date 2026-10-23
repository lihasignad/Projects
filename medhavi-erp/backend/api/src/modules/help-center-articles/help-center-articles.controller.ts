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
import { CreateHelpCenterArticleDto } from './dto/create-help-center-article.dto';
import { ListHelpCenterArticlesQueryDto } from './dto/list-help-center-articles.query';
import { UpdateHelpCenterArticleDto } from './dto/update-help-center-article.dto';
import { HelpCenterArticlesService } from './help-center-articles.service';

@ApiTags('Help Center Articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'help-center-articles', version: '1' })
export class HelpCenterArticlesController {
  constructor(private readonly helpCenterArticles: HelpCenterArticlesService) {}

  @Get()
  @RequirePermissions('help-center-articles.read')
  @ApiOperation({ summary: 'List help center articles (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of help center articles.' })
  list(@Query() query: ListHelpCenterArticlesQueryDto) {
    return this.helpCenterArticles.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('help-center-articles.read')
  @ApiOperation({ summary: 'Get a single helpCenterArticle by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.helpCenterArticles.findOne(id);
  }

  @Post()
  @RequirePermissions('help-center-articles.create')
  @ApiOperation({ summary: 'Create a new helpCenterArticle.' })
  create(@Body() dto: CreateHelpCenterArticleDto) {
    return this.helpCenterArticles.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('help-center-articles.update')
  @ApiOperation({ summary: 'Update a helpCenterArticle (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateHelpCenterArticleDto,
  ) {
    return this.helpCenterArticles.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('help-center-articles.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a helpCenterArticle.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.helpCenterArticles.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('help-center-articles.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted helpCenterArticle.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.helpCenterArticles.restore(id);
  }
}
