import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdvisorAssignmentStatus, AdvisorRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAdvisorStudentDto } from './dto/create-advisor-student.dto';
import { ListAdvisorStudentsQueryDto } from './dto/list-advisor-students.query';
import { UpdateAdvisorStudentDto } from './dto/update-advisor-student.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class AdvisorStudentsService {
  private readonly logger = new Logger(AdvisorStudentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAdvisorStudentDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const fa = await tx.facultyAdvisor.findFirst({ where: { id: dto.facultyAdvisorId, deletedAt: null } });
      if (!fa) throw new NotFoundException(`FacultyAdvisor ${dto.facultyAdvisorId} not found.`);

      const fac = await tx.faculty.findFirst({ where: { id: dto.advisorFacultyId, deletedAt: null } });
      if (!fac) throw new NotFoundException(`Faculty ${dto.advisorFacultyId} not found.`);

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);

      if (dto.academicYearId) {
        const ay = await tx.academicYear.findFirst({ where: { id: dto.academicYearId, deletedAt: null } });
        if (!ay) throw new NotFoundException(`AcademicYear ${dto.academicYearId} not found.`);
      }

      try {
        const ast = await tx.advisorStudent.create({
          data: {
            instituteId: dto.instituteId,
            facultyAdvisorId: dto.facultyAdvisorId,
            advisorFacultyId: dto.advisorFacultyId,
            studentId: dto.studentId,
            role: dto.role ?? AdvisorRole.PROGRAM_ADVISOR,
            academicYearId: dto.academicYearId ?? null,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            status: dto.status ?? AdvisorAssignmentStatus.ACTIVE,
            notes: dto.notes ?? null,
            assignedByUserId: dto.assignedByUserId ?? null,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });
        this.logger.log(`AdvisorStudent created: ${ast.id}`);
        return ast;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('AdvisorStudent record already exists for this advisor, student, role and academic year.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListAdvisorStudentsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.AdvisorStudentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.facultyAdvisorId ? { facultyAdvisorId: query.facultyAdvisorId } : {}),
      ...(query.advisorFacultyId ? { advisorFacultyId: query.advisorFacultyId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.advisorStudent.count({ where }),
      this.prisma.advisorStudent.findMany({ where, orderBy: { [query.sortBy ?? 'startDate']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const ast = await this.prisma.advisorStudent.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!ast) throw new NotFoundException(`AdvisorStudent ${id} not found.`);
    return ast;
  }

  async update(id: string, dto: UpdateAdvisorStudentDto) {
    await this.findOne(id);
    return this.prisma.advisorStudent.update({
      where: { id },
      data: {
        role: dto.role ?? undefined,
        academicYearId: dto.academicYearId !== undefined ? (dto.academicYearId ?? null) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        status: dto.status ?? undefined,
        notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
        assignedByUserId: dto.assignedByUserId !== undefined ? (dto.assignedByUserId ?? null) : undefined,
        metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.advisorStudent.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.advisorStudent.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`AdvisorStudent ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.advisorStudent.update({ where: { id }, data: { deletedAt: null } });
  }
}
