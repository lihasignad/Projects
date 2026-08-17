import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdvisorStudentsController } from './advisor-students.controller';
import { AdvisorStudentsService } from './advisor-students.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [AdvisorStudentsController], providers: [AdvisorStudentsService], exports: [AdvisorStudentsService] })
export class AdvisorStudentsModule {}
