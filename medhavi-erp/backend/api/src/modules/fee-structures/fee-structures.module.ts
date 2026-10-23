import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FeeStructuresController } from './fee-structures.controller';
import { FeeStructuresService } from './fee-structures.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FeeStructuresController],
  providers: [FeeStructuresService],
  exports: [FeeStructuresService],
})
export class FeeStructuresModule {}
