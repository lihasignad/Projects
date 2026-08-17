import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RegistrationCyclesController } from './registration-cycles.controller';
import { RegistrationCyclesService } from './registration-cycles.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [RegistrationCyclesController], providers: [RegistrationCyclesService], exports: [RegistrationCyclesService] })
export class RegistrationCyclesModule {}
