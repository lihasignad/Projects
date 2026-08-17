import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CourseRegistrationsController } from './course-registrations.controller';
import { CourseRegistrationsService } from './course-registrations.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [CourseRegistrationsController], providers: [CourseRegistrationsService], exports: [CourseRegistrationsService] })
export class CourseRegistrationsModule {}
