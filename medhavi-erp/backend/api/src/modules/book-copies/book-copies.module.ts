import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { BookCopiesController } from './book-copies.controller';
import { BookCopiesService } from './book-copies.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookCopiesController],
  providers: [BookCopiesService],
  exports: [BookCopiesService],
})
export class BookCopiesModule {}
