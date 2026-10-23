import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { BookReservationsController } from './book-reservations.controller';
import { BookReservationsService } from './book-reservations.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookReservationsController],
  providers: [BookReservationsService],
  exports: [BookReservationsService],
})
export class BookReservationsModule {}
