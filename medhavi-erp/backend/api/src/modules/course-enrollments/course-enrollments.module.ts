import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CourseEnrollmentsController } from './course-enrollments.controller';
import { CourseEnrollmentsService } from './course-enrollments.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [CourseEnrollmentsController], providers: [CourseEnrollmentsService], exports: [CourseEnrollmentsService] })
export class CourseEnrollmentsModule {}
