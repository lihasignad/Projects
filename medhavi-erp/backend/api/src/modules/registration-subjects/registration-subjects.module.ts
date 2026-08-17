import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RegistrationSubjectsController } from './registration-subjects.controller';
import { RegistrationSubjectsService } from './registration-subjects.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [RegistrationSubjectsController], providers: [RegistrationSubjectsService], exports: [RegistrationSubjectsService] })
export class RegistrationSubjectsModule {}
