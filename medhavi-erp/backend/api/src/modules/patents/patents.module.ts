import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PatentsController } from './patents.controller';
import { PatentsService } from './patents.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PatentsController],
  providers: [PatentsService],
  exports: [PatentsService],
})
export class PatentsModule {}
