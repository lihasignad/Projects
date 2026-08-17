import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LabsController],
  providers: [LabsService],
  exports: [LabsService],
})
export class LabsModule {}
