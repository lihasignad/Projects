import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, RegistrationSubjectStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateRegistrationSubjectDto } from './dto/create-registration-subject.dto';
import { ListRegistrationSubjectsQueryDto } from './dto/list-registration-subjects.query';
import { UpdateRegistrationSubjectDto } from './dto/update-registration-subject.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class RegistrationSubjectsService {
  private readonly logger = new Logger(RegistrationSubjectsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegistrationSubjectDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const reg = await tx.courseRegistration.findFirst({ where: { id: dto.registrationId, deletedAt: null } });
      if (!reg) throw new NotFoundException(`CourseRegistration ${dto.registrationId} not found.`);

      const offering = await tx.subjectOffering.findFirst({ where: { id: dto.subjectOfferingId, deletedAt: null } });
      if (!offering) throw new NotFoundException(`SubjectOffering ${dto.subjectOfferingId} not found.`);

      try {
        const rs = await tx.registrationSubject.create({
          data: {
            instituteId: dto.instituteId,
            registrationId: dto.registrationId,
            subjectOfferingId: dto.subjectOfferingId,
            status: dto.status ?? RegistrationSubjectStatus.ADDED,
            isElective: dto.isElective ?? false,
            isAudit: dto.isAudit ?? false,
            credits: new Prisma.Decimal(dto.credits),
            preferenceOrder: dto.preferenceOrder ?? null,
            addedAt: dto.addedAt ? new Date(dto.addedAt) : new Date(),
            droppedAt: dto.droppedAt ? new Date(dto.droppedAt) : null,
            reason: dto.reason ?? null,
          },
        });
        this.logger.log(`RegistrationSubject created: ${rs.id}`);
        return rs;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('RegistrationSubject record already exists for this registration and subject offering.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListRegistrationSubjectsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.RegistrationSubjectWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.registrationId ? { registrationId: query.registrationId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(typeof query.isElective === 'boolean' ? { isElective: query.isElective } : {}),
      ...(typeof query.isAudit === 'boolean' ? { isAudit: query.isAudit } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.registrationSubject.count({ where }),
      this.prisma.registrationSubject.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const rs = await this.prisma.registrationSubject.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!rs) throw new NotFoundException(`RegistrationSubject ${id} not found.`);
    return rs;
  }

  async update(id: string, dto: UpdateRegistrationSubjectDto) {
    await this.findOne(id);
    return this.prisma.registrationSubject.update({
      where: { id },
      data: {
        status: dto.status ?? undefined,
        isElective: dto.isElective !== undefined ? dto.isElective : undefined,
        isAudit: dto.isAudit !== undefined ? dto.isAudit : undefined,
        credits: dto.credits !== undefined ? new Prisma.Decimal(dto.credits) : undefined,
        preferenceOrder: dto.preferenceOrder !== undefined ? (dto.preferenceOrder ?? null) : undefined,
        addedAt: dto.addedAt ? new Date(dto.addedAt) : undefined,
        droppedAt: dto.droppedAt !== undefined ? (dto.droppedAt ? new Date(dto.droppedAt) : null) : undefined,
        reason: dto.reason !== undefined ? (dto.reason ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.registrationSubject.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.registrationSubject.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`RegistrationSubject ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.registrationSubject.update({ where: { id }, data: { deletedAt: null } });
  }
}
