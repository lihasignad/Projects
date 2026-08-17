import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ModerationsController } from './moderations.controller';
import { ModerationsService } from './moderations.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [ModerationsController], providers: [ModerationsService], exports: [ModerationsService] })
export class ModerationsModule {}
