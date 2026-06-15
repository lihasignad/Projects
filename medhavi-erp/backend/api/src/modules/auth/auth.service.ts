import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuditAction,
  LoginResult,
  Prisma,
  SecurityEventType,
  SecuritySeverity,
  SessionStatus,
  UserStatus,
} from '@prisma/client';
import { randomBytes, randomUUID } from 'crypto';
import authConfig from './config/auth.config';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuditService, RequestCtx } from './audit.service';
import { AuthResponseDto, AuthRoleDto, AuthUserDto, TokenPairDto } from './dto/auth-response.dto';
import { MeResponseDto } from './dto/me-response.dto';

// --- Naive in-process LRU cache for permissions per roleId.
// Replace with Redis adapter in production at scale.
class PermissionCache {
  private map = new Map<string, { perms: string[]; expiresAt: number }>();
  constructor(private readonly ttlMs = 5 * 60 * 1000, private readonly cap = 500) {}

  get(roleId: string): string[] | undefined {
    const hit = this.map.get(roleId);
    if (!hit) return undefined;
    if (hit.expiresAt < Date.now()) {
      this.map.delete(roleId);
      return undefined;
    }
    return hit.perms;
  }

  set(roleId: string, perms: string[]): void {
    if (this.map.size >= this.cap) {
      const firstKey = this.map.keys().next().value;
      if (firstKey) this.map.delete(firstKey);
    }
    this.map.set(roleId, { perms, expiresAt: Date.now() + this.ttlMs });
  }

  invalidate(roleId: string): void {
    this.map.delete(roleId);
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly permCache = new PermissionCache();

  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly tokens: TokenService,
    private readonly audit: AuditService,
    private readonly events: EventEmitter2,
    @Inject(authConfig.KEY) private readonly cfg: ConfigType<typeof authConfig>,
  ) {}

  // ===== LOGIN =====================================================

  async login(
    email: string,
    plainPassword: string,
    ctx: RequestCtx & { deviceName?: string },
  ): Promise<AuthResponseDto> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
      include: {
        credentials: { where: { isCurrent: true }, take: 1 },
      },
    });

    if (!user) {
      await this.audit.recordLoginAttempt({
        userId: null,
        emailTried: normalizedEmail,
        result: LoginResult.UNKNOWN_USER,
        ctx,
      });
      // generic message — no enumeration
      throw new UnauthorizedException('Invalid email or password');
    }

    // lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.audit.recordLoginAttempt({
        userId: user.id,
        emailTried: normalizedEmail,
        result: LoginResult.ACCOUNT_LOCKED,
        ctx,
      });
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) {
      await this.audit.recordLoginAttempt({
        userId: user.id,
        emailTried: normalizedEmail,
        result: LoginResult.ACCOUNT_DISABLED,
        ctx,
      });
      throw new ForbiddenException('Account is not active');
    }

    const cred = user.credentials[0];
    const ok = cred ? await this.password.verify(plainPassword, cred.passwordHash) : false;

    if (!ok) {
      await this.handleFailedLogin(user.id, normalizedEmail, ctx);
      throw new UnauthorizedException('Invalid email or password');
    }

    // success — reset counters
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ctx.ip ?? null,
        status: user.status === UserStatus.PENDING_VERIFICATION ? user.status : UserStatus.ACTIVE,
      },
    });

    const { roles, primaryRole } = await this.resolveActiveRoles(user.id);
    const permissions = await this.resolvePermissions(roles.map((r) => r.roleId));

    // create session + tokens
    const session = await this.createSessionAndTokens(
      user.id,
      user.instituteId,
      roles.map((r) => ({ key: r.key, scopeType: r.scopeType, scopeId: r.scopeId })),
      primaryRole,
      ctx,
    );

    await this.audit.recordLoginAttempt({
      userId: user.id,
      emailTried: normalizedEmail,
      result: LoginResult.SUCCESS,
      ctx,
    });
    await this.audit.recordAudit({
      instituteId: user.instituteId,
      actorUserId: user.id,
      actorRoleKey: primaryRole,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      summary: 'User logged in',
      ctx,
    });

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: 'Bearer',
      expiresIn: session.expiresIn,
      user: this.toUserDto(user),
      roles: roles.map((r) => ({
        key: r.key,
        name: r.name,
        scopeType: r.scopeType,
        scopeId: r.scopeId,
        isPrimary: r.isPrimary,
      })),
      permissions,
    };
  }

  private async handleFailedLogin(userId: string, email: string, ctx: RequestCtx): Promise<void> {
    const windowStart = new Date(Date.now() - this.cfg.lockoutWindowMin * 60_000);
    const recentFails = await this.prisma.loginAttempt.count({
      where: {
        userId,
        result: LoginResult.INVALID_CREDENTIALS,
        attemptedAt: { gte: windowStart },
      },
    });

    const nextCount = recentFails + 1;
    const shouldLock = nextCount >= this.cfg.lockoutThreshold;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: { increment: 1 },
        lockedUntil: shouldLock
          ? new Date(Date.now() + this.cfg.lockoutDurationMin * 60_000)
          : undefined,
        status: shouldLock ? UserStatus.LOCKED : undefined,
      },
    });

    await this.audit.recordLoginAttempt({
      userId,
      emailTried: email,
      result: LoginResult.INVALID_CREDENTIALS,
      ctx,
    });

    if (shouldLock) {
      await this.audit.recordSecurityEvent({
        userId,
        eventType: SecurityEventType.ACCOUNT_LOCKED,
        severity: SecuritySeverity.HIGH,
        message: `Locked after ${nextCount} failed attempts in ${this.cfg.lockoutWindowMin} min`,
        ctx,
      });
    }
  }

  // ===== REFRESH ===================================================

  async refresh(refreshToken: string, ctx: RequestCtx): Promise<TokenPairDto> {
    const payload = this.tokens.verifyRefresh(refreshToken);
    const presentedHash = this.tokens.sha256(refreshToken);

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: presentedHash },
    });

    if (!session || session.userId !== payload.sub) {
      // token signed by us but not in DB → possibly stolen & already rotated
      await this.revokeFamily(payload.fam, 'COMPROMISED_REUSE');
      await this.audit.recordSecurityEvent({
        userId: payload.sub,
        eventType: SecurityEventType.SUSPICIOUS_LOGIN,
        severity: SecuritySeverity.HIGH,
        message: 'Refresh token not found — possible reuse',
        context: { familyId: payload.fam },
        ctx,
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.status !== SessionStatus.ACTIVE || session.expiresAt < new Date()) {
      // reuse detected: a previously-rotated token was presented again
      await this.revokeFamily(session.refreshFamilyId, 'COMPROMISED_REUSE');
      await this.audit.recordSecurityEvent({
        userId: session.userId,
        eventType: SecurityEventType.SUSPICIOUS_LOGIN,
        severity: SecuritySeverity.HIGH,
        message: 'Refresh token reuse detected; family revoked',
        context: { familyId: session.refreshFamilyId, sessionId: session.id },
        ctx,
      });
      throw new UnauthorizedException('Refresh token no longer valid');
    }

    // mark current session as rotated (REVOKED + reason)
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: 'ROTATED',
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.deletedAt || user.status === UserStatus.DEACTIVATED) {
      throw new UnauthorizedException('User no longer active');
    }

    const { roles, primaryRole } = await this.resolveActiveRoles(user.id);
    const issued = await this.createSessionAndTokens(
      user.id,
      user.instituteId,
      roles.map((r) => ({ key: r.key, scopeType: r.scopeType, scopeId: r.scopeId })),
      primaryRole,
      ctx,
      session.refreshFamilyId, // preserve family
      session.deviceId,
      session.deviceName,
    );

    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      tokenType: 'Bearer',
      expiresIn: issued.expiresIn,
    };
  }

  private async revokeFamily(familyId: string, reason: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { refreshFamilyId: familyId, status: SessionStatus.ACTIVE },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  // ===== LOGOUT ====================================================

  async logout(
    payload: { sub: string; sid: string; jti: string; exp?: number },
    allDevices: boolean,
    ctx: RequestCtx,
  ): Promise<void> {
    if (allDevices) {
      await this.prisma.session.updateMany({
        where: { userId: payload.sub, status: SessionStatus.ACTIVE },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
          revokedReason: 'USER_LOGOUT_ALL',
        },
      });
    } else {
      await this.prisma.session.updateMany({
        where: { id: payload.sid, status: SessionStatus.ACTIVE },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
          revokedReason: 'USER_LOGOUT',
        },
      });
    }

    if (payload.exp) {
      await this.tokens.denylistAccess(payload.jti, payload.exp);
    }

    await this.audit.recordAudit({
      actorUserId: payload.sub,
      action: AuditAction.LOGOUT,
      entityType: 'User',
      entityId: payload.sub,
      summary: allDevices ? 'Logged out of all devices' : 'Logged out',
      ctx,
    });
  }

  // ===== FORGOT / RESET ============================================

  async forgotPassword(email: string, ctx: RequestCtx): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: normalized, deletedAt: null },
    });

    // No enumeration: always return 202 from controller, even if user missing
    if (!user) return;

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = this.tokens.sha256(rawToken);
    const expiresAt = new Date(Date.now() + this.cfg.resetTokenTtlMin * 60_000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        requestIp: ctx.ip ?? undefined,
      },
    });

    await this.audit.recordSecurityEvent({
      userId: user.id,
      eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
      severity: SecuritySeverity.INFO,
      ctx,
    });

    // Notifications module subscribes to this event and delivers email
    this.events.emit('auth.password.reset.requested', {
      userId: user.id,
      email: user.email,
      token: rawToken,
      expiresAt,
    });
  }

  async resetPassword(token: string, newPassword: string, ctx: RequestCtx): Promise<void> {
    this.password.assertPolicy(newPassword);
    const tokenHash = this.tokens.sha256(token);

    const row = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!row || row.consumedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newHash = await this.password.hash(newPassword);

    await this.prisma.$transaction(async (tx) => {
      // mark token consumed
      await tx.passwordResetToken.update({
        where: { id: row.id },
        data: { consumedAt: new Date() },
      });

      // demote existing credentials and insert new current one
      await tx.authCredential.updateMany({
        where: { userId: row.userId, isCurrent: true },
        data: { isCurrent: false },
      });
      await tx.authCredential.create({
        data: {
          userId: row.userId,
          passwordHash: newHash,
          algorithm: 'bcrypt',
          isCurrent: true,
        },
      });

      // revoke all active sessions — force re-login everywhere
      await tx.session.updateMany({
        where: { userId: row.userId, status: SessionStatus.ACTIVE },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
          revokedReason: 'PASSWORD_RESET',
        },
      });

      await tx.user.update({
        where: { id: row.userId },
        data: {
          mustChangePassword: false,
          failedLoginCount: 0,
          lockedUntil: null,
          status: UserStatus.ACTIVE,
        },
      });
    });

    await this.audit.recordSecurityEvent({
      userId: row.userId,
      eventType: SecurityEventType.PASSWORD_CHANGED,
      severity: SecuritySeverity.MEDIUM,
      ctx,
    });
    await this.audit.recordAudit({
      actorUserId: row.userId,
      action: AuditAction.UPDATE,
      entityType: 'AuthCredential',
      entityId: row.userId,
      summary: 'Password reset via token',
      ctx,
    });
  }

  // ===== ME ========================================================

  async me(userId: string): Promise<MeResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new UnauthorizedException();

    const { roles, primaryRole } = await this.resolveActiveRoles(userId);
    const permissions = await this.resolvePermissions(roles.map((r) => r.roleId));

    return {
      user: this.toUserDto(user),
      roles: roles.map((r) => ({
        key: r.key,
        name: r.name,
        scopeType: r.scopeType,
        scopeId: r.scopeId,
        isPrimary: r.isPrimary,
      })),
      permissions,
      primaryRole,
    };
  }

  // ===== INTERNAL HELPERS ==========================================

  private async createSessionAndTokens(
    userId: string,
    instituteId: string | null,
    roles: Array<{ key: string; scopeType: string; scopeId: string | null }>,
    primaryRole: string | null,
    ctx: RequestCtx & { deviceName?: string },
    familyId?: string,
    deviceId?: string | null,
    deviceName?: string | null,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; sessionId: string }> {
    const sessionId = randomUUID();
    const refreshFamilyId = familyId ?? randomUUID();

    const refresh = this.tokens.signRefresh({ userId, sessionId, familyId: refreshFamilyId });
    const access = this.tokens.signAccess({
      userId,
      instituteId,
      roles,
      primaryRole,
      sessionId,
      refreshFamilyId,
    });

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        refreshTokenHash: this.tokens.sha256(refresh.token),
        refreshFamilyId,
        deviceId: deviceId ?? undefined,
        deviceName: deviceName ?? ctx.deviceName ?? undefined,
        userAgent: ctx.userAgent ?? undefined,
        ipAddress: ctx.ip ?? undefined,
        status: SessionStatus.ACTIVE,
        expiresAt: refresh.expiresAt,
      },
    });

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      expiresIn: access.expiresIn,
      sessionId,
    };
  }

  private async resolveActiveRoles(userId: string): Promise<{
    roles: Array<{
      roleId: string;
      key: string;
      name: string;
      scopeType: string;
      scopeId: string | null;
      isPrimary: boolean;
      rank: number;
    }>;
    primaryRole: string | null;
  }> {
    const now = new Date();
    const rows = await this.prisma.userRole.findMany({
      where: {
        userId,
        deletedAt: null,
        OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        AND: [{ OR: [{ validFrom: null }, { validFrom: { lte: now } }] }],
      },
      include: { role: true },
    });

    const roles = rows
      .filter((r) => r.role.deletedAt === null && r.role.isAssignable !== false)
      .map((r) => ({
        roleId: r.roleId,
        key: r.role.key,
        name: r.role.name,
        scopeType: r.scopeType,
        scopeId: r.scopeId,
        isPrimary: r.isPrimary,
        rank: r.role.rank,
      }));

    const primary =
      roles.find((r) => r.isPrimary) ??
      [...roles].sort((a, b) => a.rank - b.rank)[0]; // lowest rank == most senior
    return { roles, primaryRole: primary?.key ?? null };
  }

  private async resolvePermissions(roleIds: string[]): Promise<string[]> {
    if (roleIds.length === 0) return [];
    const uniqueIds = [...new Set(roleIds)];
    const collected = new Set<string>();
    const missing: string[] = [];

    for (const id of uniqueIds) {
      const cached = this.permCache.get(id);
      if (cached) cached.forEach((p) => collected.add(p));
      else missing.push(id);
    }

    if (missing.length) {
      const rows = await this.prisma.rolePermission.findMany({
        where: { roleId: { in: missing } },
        include: { permission: true },
      });
      const grouped = new Map<string, string[]>();
      for (const r of rows) {
        const arr = grouped.get(r.roleId) ?? [];
        arr.push(r.permission.key);
        grouped.set(r.roleId, arr);
      }
      for (const id of missing) {
        const perms = grouped.get(id) ?? [];
        this.permCache.set(id, perms);
        perms.forEach((p) => collected.add(p));
      }
    }

    return [...collected].sort();
  }

  /** Public helper used by guards to fetch permissions without re-resolving roles. */
  async permissionsForUser(userId: string): Promise<string[]> {
    const { roles } = await this.resolveActiveRoles(userId);
    return this.resolvePermissions(roles.map((r) => r.roleId));
  }

  invalidatePermissionCache(roleId: string): void {
    this.permCache.invalidate(roleId);
  }

  private toUserDto(user: {
    id: string;
    instituteId: string | null;
    email: string;
    firstName: string;
    lastName: string | null;
    displayName: string | null;
    status: UserStatus;
    mfaEnabled: boolean;
    mustChangePassword: boolean;
  }): AuthUserDto {
    return {
      id: user.id,
      instituteId: user.instituteId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      status: user.status,
      mfaEnabled: user.mfaEnabled,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
