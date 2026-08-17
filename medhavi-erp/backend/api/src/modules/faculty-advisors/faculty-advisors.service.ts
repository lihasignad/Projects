import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdvisorAssignmentStatus, AdvisorRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateFacultyAdvisorDto } from './dto/create-faculty-advisor.dto';
import { ListFacultyAdvisorsQueryDto } from './dto/list-faculty-advisors.query';
import { UpdateFacultyAdvisorDto } from './dto/update-faculty-advisor.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class FacultyAdvisorsService {
  private readonly logger = new Logger(FacultyAdvisorsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacultyAdvisorDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const fac = await tx.faculty.findFirst({ where: { id: dto.facultyId, deletedAt: null } });
      if (!fac) throw new NotFoundException(`Faculty ${dto.facultyId} not found.`);
      if (fac.instituteId !== dto.instituteId) throw new BadRequestException('Faculty does not belong to institute.');

      if (dto.academicYearId) {
        const ay = await tx.academicYear.findFirst({ where: { id: dto.academicYearId, deletedAt: null } });
        if (!ay) throw new NotFoundException(`AcademicYear ${dto.academicYearId} not found.`);
      }

      try {
        const fa = await tx.facultyAdvisor.create({
          data: {
            instituteId: dto.instituteId,
            facultyId: dto.facultyId,
            role: dto.role ?? AdvisorRole.PROGRAM_ADVISOR,
            scopeType: dto.scopeType,
            scopeId: dto.scopeId,
            academicYearId: dto.academicYearId ?? null,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            status: dto.status ?? AdvisorAssignmentStatus.ACTIVE,
            assignedByUserId: dto.assignedByUserId ?? null,
            remarks: dto.remarks ?? null,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });
        this.logger.log(`FacultyAdvisor created: ${fa.id}`);
        return fa;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('FacultyAdvisor assignment already exists for this scope, role and academic year.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListFacultyAdvisorsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.FacultyAdvisorWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.facultyId ? { facultyId: query.facultyId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.scopeType ? { scopeType: query.scopeType } : {}),
      ...(query.scopeId ? { scopeId: query.scopeId } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.facultyAdvisor.count({ where }),
      this.prisma.facultyAdvisor.findMany({ where, orderBy: { [query.sortBy ?? 'startDate']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const fa = await this.prisma.facultyAdvisor.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!fa) throw new NotFoundException(`FacultyAdvisor ${id} not found.`);
    return fa;
  }

  async update(id: string, dto: UpdateFacultyAdvisorDto) {
    await this.findOne(id);
    return this.prisma.facultyAdvisor.update({
      where: { id },
      data: {
        role: dto.role ?? undefined,
        scopeType: dto.scopeType ?? undefined,
        scopeId: dto.scopeId ?? undefined,
        academicYearId: dto.academicYearId !== undefined ? (dto.academicYearId ?? null) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        status: dto.status ?? undefined,
        assignedByUserId: dto.assignedByUserId !== undefined ? (dto.assignedByUserId ?? null) : undefined,
        remarks: dto.remarks !== undefined ? (dto.remarks ?? null) : undefined,
        metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.facultyAdvisor.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.facultyAdvisor.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`FacultyAdvisor ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.facultyAdvisor.update({ where: { id }, data: { deletedAt: null } });
  }
}
