import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { InstitutesController } from './institutes.controller';
import { InstitutesService } from './institutes.service';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ],
  controllers: [InstitutesController],
  providers: [
    InstitutesService,
    ],
  exports: [InstitutesService],
})
export class InstitutesModule {}
