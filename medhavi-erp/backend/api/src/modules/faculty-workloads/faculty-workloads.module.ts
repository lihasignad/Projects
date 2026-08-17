import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FacultyWorkloadsController } from './faculty-workloads.controller';
import { FacultyWorkloadsService } from './faculty-workloads.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [FacultyWorkloadsController], providers: [FacultyWorkloadsService], exports: [FacultyWorkloadsService] })
export class FacultyWorkloadsModule {}
