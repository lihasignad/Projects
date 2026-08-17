import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { HallTicketsController } from './hall-tickets.controller';
import { HallTicketsService } from './hall-tickets.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [HallTicketsController], providers: [HallTicketsService], exports: [HallTicketsService] })
export class HallTicketsModule {}
