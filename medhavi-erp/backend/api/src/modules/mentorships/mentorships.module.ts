import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MentorshipsController } from './mentorships.controller';
import { MentorshipsService } from './mentorships.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [MentorshipsController], providers: [MentorshipsService], exports: [MentorshipsService] })
export class MentorshipsModule {}
