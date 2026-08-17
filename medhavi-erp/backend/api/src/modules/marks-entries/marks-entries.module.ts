import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MarksEntriesController } from './marks-entries.controller';
import { MarksEntriesService } from './marks-entries.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [MarksEntriesController], providers: [MarksEntriesService], exports: [MarksEntriesService] })
export class MarksEntriesModule {}
