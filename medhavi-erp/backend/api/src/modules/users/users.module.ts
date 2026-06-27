import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * UsersModule
 *
 * CRUD for the User aggregate (identity profile only). Mirrors
 * ProgramsModule:
 * - Imports PrismaModule for DB access (from infrastructure/prisma).
 * - Imports AuthModule to consume the exported JwtAuthGuard and
 *   PermissionsGuard. No local auth providers are declared.
 *
 * NOTE: Passwords, login, MFA, sessions, credentials and authentication
 * remain owned by AuthModule. This module never touches AuthCredential,
 * Session, MfaFactor or token tables.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
