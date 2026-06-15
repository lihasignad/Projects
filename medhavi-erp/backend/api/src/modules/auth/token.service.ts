import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import authConfig from './config/auth.config';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { RedisService } from '@/infrastructure/common/redis/redis.service';

export interface JwtAccessPayload {
  sub: string;
  iid: string | null;
  roles: Array<{ key: string; scopeType: string; scopeId: string | null }>;
  primaryRole: string | null;
  sid: string;
  typ: 'access';
  jti: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  sid: string;
  fam: string;
  typ: 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
}

export interface IssueTokensInput {
  userId: string;
  instituteId: string | null;
  roles: JwtAccessPayload['roles'];
  primaryRole: string | null;
  sessionId: string;
  refreshFamilyId: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(authConfig.KEY) private readonly cfg: ConfigType<typeof authConfig>,
  ) {}

  sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  signAccess(input: IssueTokensInput): { token: string; jti: string; expiresIn: number } {
    const jti = randomUUID();
    const payload: JwtAccessPayload = {
      sub: input.userId,
      iid: input.instituteId,
      roles: input.roles,
      primaryRole: input.primaryRole,
      sid: input.sessionId,
      typ: 'access',
      jti,
    };
    const token = this.jwt.sign(payload, {
      secret: this.cfg.accessSecret,
      expiresIn: this.cfg.accessTtl,
      issuer: this.cfg.issuer,
      audience: this.cfg.audience,
    });
    return { token, jti, expiresIn: this.ttlToSeconds(this.cfg.accessTtl) };
  }

  signRefresh(input: { userId: string; sessionId: string; familyId: string }): {
    token: string;
    jti: string;
    expiresAt: Date;
  } {
    const jti = randomUUID();
    const payload: JwtRefreshPayload = {
      sub: input.userId,
      sid: input.sessionId,
      fam: input.familyId,
      typ: 'refresh',
      jti,
    };
    const token = this.jwt.sign(payload, {
      secret: this.cfg.refreshSecret,
      expiresIn: this.cfg.refreshTtl,
      issuer: this.cfg.issuer,
      audience: this.cfg.audience,
    });
    const expiresAt = new Date(Date.now() + this.ttlToSeconds(this.cfg.refreshTtl) * 1000);
    return { token, jti, expiresAt };
  }

  verifyRefresh(token: string): JwtRefreshPayload {
    try {
      return this.jwt.verify<JwtRefreshPayload>(token, {
        secret: this.cfg.refreshSecret,
        issuer: this.cfg.issuer,
        audience: this.cfg.audience,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // ---- Access-token denylist (Redis) ----

  private denylistKey(jti: string) {
    return `auth:denylist:${jti}`;
  }

  async denylistAccess(jti: string, expEpochSec: number): Promise<void> {
    const ttl = Math.max(1, expEpochSec - Math.floor(Date.now() / 1000));
    await this.redis.client.set(this.denylistKey(jti), '1', 'EX', ttl);
  }

  async isAccessDenylisted(jti: string): Promise<boolean> {
    return (await this.redis.client.exists(this.denylistKey(jti))) === 1;
  }

  // ---- helpers ----

  ttlToSeconds(ttl: string): number {
    const m = /^(\d+)\s*(s|m|h|d)?$/i.exec(ttl.trim());
    if (!m) throw new Error(`Invalid TTL: ${ttl}`);
    const n = parseInt(m[1], 10);
    switch ((m[2] ?? 's').toLowerCase()) {
      case 's': return n;
      case 'm': return n * 60;
      case 'h': return n * 3600;
      case 'd': return n * 86400;
      default: return n;
    }
  }
}
