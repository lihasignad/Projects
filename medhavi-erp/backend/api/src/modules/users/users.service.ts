import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query';
import { UpdateUserDto } from './dto/update-user.dto';

// Re-exported for future audit-log re-integration (mirrors programs.service).
export { AuditAction };

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * UsersService
 *
 * CRUD + soft delete for the User aggregate (identity profile only).
 * Audit logging is intentionally omitted in this revision (parity with
 * programs.service); AuditAction is re-exported so a follow-up can re-wire
 * AuditService without touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId`, when provided, must reference a non-deleted Institute.
 *  - `email` is globally unique among non-deleted users — proactive + P2002.
 *  - `phone`, when provided, is globally unique among non-deleted users —
 *    proactive + P2002.
 *
 * This service NEVER creates or mutates AuthCredential, Session, MfaFactor,
 * PasswordResetToken or EmailVerificationToken rows. Authentication remains
 * the exclusive responsibility of AuthModule.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateUserDto) {
    if (dto.instituteId) {
      await this.assertInstituteExists(dto.instituteId);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.assertEmailUnique(tx, dto.email);
      if (dto.phone) {
        await this.assertPhoneUnique(tx, dto.phone);
      }
    });

    try {
      const user = await this.prisma.user.create({
        data: {
          instituteId: dto.instituteId ?? null,
          email: dto.email,
          phone: dto.phone ?? null,
          firstName: dto.firstName,
          middleName: dto.middleName ?? null,
          lastName: dto.lastName,
          displayName: dto.displayName ?? null,
          gender: dto.gender ?? null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          avatarFileId: dto.avatarFileId ?? null,
          preferredLanguage: dto.preferredLanguage ?? undefined,
          timezone: dto.timezone ?? null,
          metadata: (dto.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
          status: dto.status ?? UserStatus.PENDING_VERIFICATION,
        },
      });

      this.logger.log(`User created: ${user.id} (${user.email})`);
      return user;
    } catch (err) {
      this.translateUniqueViolation(err, dto.email, dto.phone);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListUsersQueryDto,
  ): Promise<
    PaginatedResult<Awaited<ReturnType<typeof this.prisma.user.findFirst>>>
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.UserWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.gender ? { gender: query.gender } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' } },
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { displayName: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  // --------------------------------------------------------------------------
  // READ — single
  // --------------------------------------------------------------------------
  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!user) throw new NotFoundException(`User ${id} not found.`);
    return user;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.findOne(id);

    await this.prisma.$transaction(async (tx) => {
      if (dto.email && dto.email !== existing.email) {
        await this.assertEmailUnique(tx, dto.email, id);
      }
      if (dto.phone !== undefined && dto.phone !== existing.phone) {
        if (dto.phone) {
          await this.assertPhoneUnique(tx, dto.phone, id);
        }
      }
    });

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email ?? undefined,
          phone: dto.phone === undefined ? undefined : dto.phone,
          firstName: dto.firstName ?? undefined,
          middleName: dto.middleName === undefined ? undefined : dto.middleName,
          lastName: dto.lastName ?? undefined,
          displayName:
            dto.displayName === undefined ? undefined : dto.displayName,
          gender: dto.gender === undefined ? undefined : dto.gender,
          dateOfBirth:
            dto.dateOfBirth === undefined
              ? undefined
              : dto.dateOfBirth === null
                ? null
                : new Date(dto.dateOfBirth),
          avatarFileId:
            dto.avatarFileId === undefined ? undefined : dto.avatarFileId,
          preferredLanguage: dto.preferredLanguage ?? undefined,
          timezone: dto.timezone === undefined ? undefined : dto.timezone,
          metadata:
            dto.metadata === undefined
              ? undefined
              : (dto.metadata as Prisma.InputJsonValue),
          status: dto.status ?? undefined,
        },
      });
    } catch (err) {
      this.translateUniqueViolation(err, dto.email, dto.phone);
      throw err;
    }
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.user.update({
      where: { id: existing.id },
      data: {
        deletedAt: new Date(),
        status: UserStatus.DEACTIVATED,
      },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    const existing = await this.findOne(id, { includeDeleted: true });
    if (!existing.deletedAt) return existing;

    // Re-validate that the parent institute is still alive and that the
    // email/phone are still available among non-deleted users.
    if (existing.instituteId) {
      await this.assertInstituteExists(existing.instituteId);
    }
    await this.prisma.$transaction(async (tx) => {
      await this.assertEmailUnique(tx, existing.email, existing.id);
      if (existing.phone) {
        await this.assertPhoneUnique(tx, existing.phone, existing.id);
      }
    });

    return this.prisma.user.update({
      where: { id: existing.id },
      data: {
        deletedAt: null,
        status: UserStatus.PENDING_VERIFICATION,
      },
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private async assertInstituteExists(instituteId: string) {
    const institute = await this.prisma.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!institute) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertEmailUnique(
    tx: Prisma.TransactionClient,
    email: string,
    ignoreId?: string,
  ) {
    const clash = await tx.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `Email "${email}" is already in use by another user.`,
      );
    }
  }

  private async assertPhoneUnique(
    tx: Prisma.TransactionClient,
    phone: string,
    ignoreId?: string,
  ) {
    const clash = await tx.user.findFirst({
      where: {
        phone,
        deletedAt: null,
        ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `Phone "${phone}" is already in use by another user.`,
      );
    }
  }

  /**
   * Translates a Prisma P2002 unique-constraint violation on `email` or
   * `phone` into the user-facing ConflictException; rethrows anything else.
   */
  private translateUniqueViolation(
    err: unknown,
    email?: string,
    phone?: string,
  ): void {
    if (
      !(err instanceof Prisma.PrismaClientKnownRequestError) ||
      err.code !== 'P2002'
    ) {
      return;
    }
    const target = err.meta?.target;
    const fields = Array.isArray(target)
      ? target
      : typeof target === 'string'
        ? [target]
        : [];

    if (fields.some((f) => f.toLowerCase().includes('email'))) {
      throw new ConflictException(
        `Email "${email ?? ''}" is already in use by another user.`,
      );
    }
    if (fields.some((f) => f.toLowerCase().includes('phone'))) {
      throw new ConflictException(
        `Phone "${phone ?? ''}" is already in use by another user.`,
      );
    }
    throw new ConflictException(
      'A user with the provided unique attributes already exists.',
    );
  }

  // Reserved for future use by callers that need to compose with this service.
  // Kept private to avoid leaking internal validation surface. Currently unused
  // outside of this file but retained to mirror the helper layout in
  // programs.service.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _bad(msg: string): never {
    throw new BadRequestException(msg);
  }
}
