import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LibraryFinesController } from './library-fines.controller';
import { LibraryFinesService } from './library-fines.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LibraryFinesController],
  providers: [LibraryFinesService],
  exports: [LibraryFinesService],
})
export class LibraryFinesModule {}
