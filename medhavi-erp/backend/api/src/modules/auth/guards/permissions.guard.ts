import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthService } from '../auth.service';
import { JwtAccessPayload } from '../token.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user: JwtAccessPayload | undefined = ctx.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('No authenticated user');

    const permissions = await this.auth.permissionsForUser(user.sub);

    if (permissions.includes('*')) {
      return true;
    }

    const held = new Set(permissions);
    const missing = required.filter((p) => !held.has(p));
    if (missing.length) {
      throw new ForbiddenException(`Missing permissions: ${missing.join(', ')}`);
    }
    return true;
  }
}
