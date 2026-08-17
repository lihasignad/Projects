import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseRegistrationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCourseRegistrationDto } from './dto/create-course-registration.dto';
import { ListCourseRegistrationsQueryDto } from './dto/list-course-registrations.query';
import { UpdateCourseRegistrationDto } from './dto/update-course-registration.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class CourseRegistrationsService {
  private readonly logger = new Logger(CourseRegistrationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseRegistrationDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const cycle = await tx.registrationCycle.findFirst({ where: { id: dto.cycleId, deletedAt: null } });
      if (!cycle) throw new NotFoundException(`RegistrationCycle ${dto.cycleId} not found.`);

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);

      const term = await tx.term.findFirst({ where: { id: dto.termId, deletedAt: null } });
      if (!term) throw new NotFoundException(`Term ${dto.termId} not found.`);

      try {
        const cr = await tx.courseRegistration.create({
          data: {
            instituteId: dto.instituteId,
            cycleId: dto.cycleId,
            studentId: dto.studentId,
            termId: dto.termId,
            status: dto.status ?? CourseRegistrationStatus.DRAFT,
            totalCredits: new Prisma.Decimal(dto.totalCredits ?? 0),
            submittedAt: dto.submittedAt ? new Date(dto.submittedAt) : null,
            advisorApprovedAt: dto.advisorApprovedAt ? new Date(dto.advisorApprovedAt) : null,
            advisorUserId: dto.advisorUserId ?? null,
            hodApprovedAt: dto.hodApprovedAt ? new Date(dto.hodApprovedAt) : null,
            hodUserId: dto.hodUserId ?? null,
            rejectedReason: dto.rejectedReason ?? null,
          },
        });
        this.logger.log(`CourseRegistration created: ${cr.id}`);
        return cr;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('CourseRegistration record already exists for this student in this cycle.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListCourseRegistrationsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.CourseRegistrationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.cycleId ? { cycleId: query.cycleId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.courseRegistration.count({ where }),
      this.prisma.courseRegistration.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const cr = await this.prisma.courseRegistration.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!cr) throw new NotFoundException(`CourseRegistration ${id} not found.`);
    return cr;
  }

  async update(id: string, dto: UpdateCourseRegistrationDto) {
    await this.findOne(id);
    return this.prisma.courseRegistration.update({
      where: { id },
      data: {
        status: dto.status ?? undefined,
        totalCredits: dto.totalCredits !== undefined ? new Prisma.Decimal(dto.totalCredits) : undefined,
        submittedAt: dto.submittedAt !== undefined ? (dto.submittedAt ? new Date(dto.submittedAt) : null) : undefined,
        advisorApprovedAt: dto.advisorApprovedAt !== undefined ? (dto.advisorApprovedAt ? new Date(dto.advisorApprovedAt) : null) : undefined,
        advisorUserId: dto.advisorUserId !== undefined ? (dto.advisorUserId ?? null) : undefined,
        hodApprovedAt: dto.hodApprovedAt !== undefined ? (dto.hodApprovedAt ? new Date(dto.hodApprovedAt) : null) : undefined,
        hodUserId: dto.hodUserId !== undefined ? (dto.hodUserId ?? null) : undefined,
        rejectedReason: dto.rejectedReason !== undefined ? (dto.rejectedReason ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.courseRegistration.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.courseRegistration.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`CourseRegistration ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.courseRegistration.update({ where: { id }, data: { deletedAt: null } });
  }
}
