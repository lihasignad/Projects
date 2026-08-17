import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ExamSchedulesController } from './exam-schedules.controller';
import { ExamSchedulesService } from './exam-schedules.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [ExamSchedulesController], providers: [ExamSchedulesService], exports: [ExamSchedulesService] })
export class ExamSchedulesModule {}
