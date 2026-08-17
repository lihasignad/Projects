import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TranscriptsController } from './transcripts.controller';
import { TranscriptsService } from './transcripts.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [TranscriptsController], providers: [TranscriptsService], exports: [TranscriptsService] })
export class TranscriptsModule {}
