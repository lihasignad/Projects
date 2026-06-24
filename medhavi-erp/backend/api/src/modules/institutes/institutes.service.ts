import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, InstituteStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService, RequestCtx } from '../auth/audit.service';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { ListInstitutesQueryDto } from './dto/list-institutes.query';
import { UpdateInstituteDto } from './dto/update-institute.dto';

@Injectable()
export class InstitutesService {
  private readonly logger = new Logger(InstitutesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== CREATE =====
  async create(dto: CreateInstituteDto, actorUserId: string | null, ctx: RequestCtx) {
    await this.assertUniqueCode(dto.code);
    if (dto.domain) await this.assertUniqueDomain(dto.domain);

    const created = await this.prisma.institute.create({
      data: {
        code: dto.code,
        name: dto.name,
        legalName: dto.legalName,
        domain: dto.domain,
        timezone: dto.timezone ?? 'Asia/Kolkata',
        locale: dto.locale ?? 'en-IN',
        status: dto.status ?? InstituteStatus.ACTIVE,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        postalCode: dto.postalCode,
        metadata: (dto.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    await this.audit.recordAudit({
      instituteId: created.id,
      actorUserId,
      action: AuditAction.CREATE,
      entityType: 'Institute',
      entityId: created.id,
      summary: `Created institute ${created.code}`,
      after: created as unknown as Prisma.InputJsonValue,
      ctx,
    });

    return created;
  }

  // ===== LIST =====
  async list(q: ListInstitutesQueryDto) {
    const where: Prisma.InstituteWhereInput = {
      ...(q.includeDeleted ? {} : { deletedAt: null }),
      ...(q.status ? { status: q.status } : {}),
      ...(q.search
        ? {
            OR: [
              { name: { contains: q.search, mode: 'insensitive' } },
              { code: { contains: q.search, mode: 'insensitive' } },
              { domain: { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.institute.count({ where }),
      this.prisma.institute.findMany({
        where,
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        orderBy: [{ createdAt: 'desc' }],
      }),
    ]);

    return { data, total, page: q.page, pageSize: q.pageSize };
  }

  // ===== GET ONE =====
  async findOne(id: string, includeDeleted = false) {
    const inst = await this.prisma.institute.findFirst({
      where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    });
    if (!inst) throw new NotFoundException(`Institute ${id} not found`);
    return inst;
  }

  // ===== UPDATE =====
  async update(
    id: string,
    dto: UpdateInstituteDto,
    actorUserId: string | null,
    ctx: RequestCtx,
  ) {
    const before = await this.findOne(id, true);

    if (dto.code && dto.code !== before.code) await this.assertUniqueCode(dto.code, id);
    if (dto.domain && dto.domain !== before.domain) await this.assertUniqueDomain(dto.domain, id);

    const updated = await this.prisma.institute.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        legalName: dto.legalName,
        domain: dto.domain,
        timezone: dto.timezone,
        locale: dto.locale,
        status: dto.status,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        country: dto.country,
        postalCode: dto.postalCode,
        metadata:
          dto.metadata === undefined
            ? undefined
            : (dto.metadata as Prisma.InputJsonValue),
      },
    });

    await this.audit.recordAudit({
      instituteId: updated.id,
      actorUserId,
      action: AuditAction.UPDATE,
      entityType: 'Institute',
      entityId: updated.id,
      summary: `Updated institute ${updated.code}`,
      before: before as unknown as Prisma.InputJsonValue,
      after: updated as unknown as Prisma.InputJsonValue,
      ctx,
    });

    return updated;
  }

  // ===== SOFT DELETE =====
  async remove(id: string, actorUserId: string | null, ctx: RequestCtx) {
    const before = await this.findOne(id);

    const updated = await this.prisma.institute.update({
      where: { id },
      data: { deletedAt: new Date(), status: InstituteStatus.ARCHIVED },
    });

    await this.audit.recordAudit({
      instituteId: updated.id,
      actorUserId,
      action: AuditAction.DELETE,
      entityType: 'Institute',
      entityId: updated.id,
      summary: `Soft-deleted institute ${updated.code}`,
      before: before as unknown as Prisma.InputJsonValue,
      after: updated as unknown as Prisma.InputJsonValue,
      ctx,
    });

    return { id: updated.id, deletedAt: updated.deletedAt };
  }

  // ===== RESTORE =====
  async restore(id: string, actorUserId: string | null, ctx: RequestCtx) {
    const before = await this.findOne(id, true);
    if (!before.deletedAt) return before;

    const updated = await this.prisma.institute.update({
      where: { id },
      data: { deletedAt: null, status: InstituteStatus.ACTIVE },
    });

    await this.audit.recordAudit({
      instituteId: updated.id,
      actorUserId,
      action: AuditAction.RESTORE,
      entityType: 'Institute',
      entityId: updated.id,
      summary: `Restored institute ${updated.code}`,
      before: before as unknown as Prisma.InputJsonValue,
      after: updated as unknown as Prisma.InputJsonValue,
      ctx,
    });

    return updated;
  }

  // ===== helpers =====
  private async assertUniqueCode(code: string, excludeId?: string) {
    const existing = await this.prisma.institute.findUnique({ where: { code } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Institute code "${code}" is already in use`);
    }
  }

  private async assertUniqueDomain(domain: string, excludeId?: string) {
    const existing = await this.prisma.institute.findUnique({ where: { domain } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Institute domain "${domain}" is already in use`);
    }
  }
}
