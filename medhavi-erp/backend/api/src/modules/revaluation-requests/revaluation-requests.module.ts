import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RevaluationRequestsController } from './revaluation-requests.controller';
import { RevaluationRequestsService } from './revaluation-requests.service';

@Module({ imports: [PrismaModule, AuthModule], controllers: [RevaluationRequestsController], providers: [RevaluationRequestsService], exports: [RevaluationRequestsService] })
export class RevaluationRequestsModule {}
