import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { InvigilationAssignmentsController } from './invigilation-assignments.controller';
import { InvigilationAssignmentsService } from './invigilation-assignments.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [InvigilationAssignmentsController], providers: [InvigilationAssignmentsService], exports: [InvigilationAssignmentsService] })
export class InvigilationAssignmentsModule {}
