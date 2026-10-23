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
import { CreatePlacementOfferDto } from './dto/create-placement-offer.dto';
import { ListPlacementOffersQueryDto } from './dto/list-placement-offers.query';
import { UpdatePlacementOfferDto } from './dto/update-placement-offer.dto';
import { PlacementOffersService } from './placement-offers.service';

@ApiTags('Placement Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'placement-offers', version: '1' })
export class PlacementOffersController {
  constructor(private readonly placementOffers: PlacementOffersService) {}

  @Get()
  @RequirePermissions('placement-offers.read')
  @ApiOperation({ summary: 'List placement offers (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of placement offers.' })
  list(@Query() query: ListPlacementOffersQueryDto) {
    return this.placementOffers.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('placement-offers.read')
  @ApiOperation({ summary: 'Get a single placementOffer by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementOffers.findOne(id);
  }

  @Post()
  @RequirePermissions('placement-offers.create')
  @ApiOperation({ summary: 'Create a new placementOffer.' })
  create(@Body() dto: CreatePlacementOfferDto) {
    return this.placementOffers.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('placement-offers.update')
  @ApiOperation({ summary: 'Update a placementOffer (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdatePlacementOfferDto,
  ) {
    return this.placementOffers.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('placement-offers.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a placementOffer.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementOffers.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('placement-offers.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted placementOffer.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.placementOffers.restore(id);
  }
}
