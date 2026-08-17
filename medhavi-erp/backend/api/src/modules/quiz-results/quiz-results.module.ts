import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { QuizResultsController } from './quiz-results.controller';
import { QuizResultsService } from './quiz-results.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [QuizResultsController], providers: [QuizResultsService], exports: [QuizResultsService] })
export class QuizResultsModule {}
