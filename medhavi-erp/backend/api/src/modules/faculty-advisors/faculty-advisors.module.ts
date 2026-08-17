import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FacultyAdvisorsController } from './faculty-advisors.controller';
import { FacultyAdvisorsService } from './faculty-advisors.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [FacultyAdvisorsController], providers: [FacultyAdvisorsService], exports: [FacultyAdvisorsService] })
export class FacultyAdvisorsModule {}
