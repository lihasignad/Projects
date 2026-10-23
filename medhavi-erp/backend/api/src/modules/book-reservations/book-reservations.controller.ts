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
import { CreateBookReservationDto } from './dto/create-book-reservation.dto';
import { ListBookReservationsQueryDto } from './dto/list-book-reservations.query';
import { UpdateBookReservationDto } from './dto/update-book-reservation.dto';
import { BookReservationsService } from './book-reservations.service';

@ApiTags('Book Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'book-reservations', version: '1' })
export class BookReservationsController {
  constructor(private readonly bookReservations: BookReservationsService) {}

  @Get()
  @RequirePermissions('book-reservations.read')
  @ApiOperation({ summary: 'List book reservations (paginated, filterable).' })
  @ApiOkResponse({ description: 'Paginated list of book reservations.' })
  list(@Query() query: ListBookReservationsQueryDto) {
    return this.bookReservations.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('book-reservations.read')
  @ApiOperation({ summary: 'Get a single bookReservation by id.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookReservations.findOne(id);
  }

  @Post()
  @RequirePermissions('book-reservations.create')
  @ApiOperation({ summary: 'Create a new bookReservation.' })
  create(@Body() dto: CreateBookReservationDto) {
    return this.bookReservations.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('book-reservations.update')
  @ApiOperation({ summary: 'Update a bookReservation (partial).' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBookReservationDto,
  ) {
    return this.bookReservations.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('book-reservations.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a bookReservation.' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookReservations.remove(id);
  }

  @Post(':id/restore')
  @RequirePermissions('book-reservations.restore')
  @ApiOperation({ summary: 'Restore a previously soft-deleted bookReservation.' })
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.bookReservations.restore(id);
  }
}
