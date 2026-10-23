import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { BookIssuesController } from './book-issues.controller';
import { BookIssuesService } from './book-issues.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BookIssuesController],
  providers: [BookIssuesService],
  exports: [BookIssuesService],
})
export class BookIssuesModule {}
