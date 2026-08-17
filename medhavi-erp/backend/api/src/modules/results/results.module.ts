import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [ResultsController], providers: [ResultsService], exports: [ResultsService] })
export class ResultsModule {}
