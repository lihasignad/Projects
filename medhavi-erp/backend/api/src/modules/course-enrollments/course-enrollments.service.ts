import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CourseEnrollmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCourseEnrollmentDto } from './dto/create-course-enrollment.dto';
import { ListCourseEnrollmentsQueryDto } from './dto/list-course-enrollments.query';
import { UpdateCourseEnrollmentDto } from './dto/update-course-enrollment.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class CourseEnrollmentsService {
  private readonly logger = new Logger(CourseEnrollmentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseEnrollmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const course = await tx.course.findFirst({ where: { id: dto.courseId, deletedAt: null } });
      if (!course) throw new NotFoundException(`Course ${dto.courseId} not found.`);
      if (course.instituteId !== dto.instituteId) throw new BadRequestException('Course does not belong to institute.');

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);
      if (st.instituteId !== dto.instituteId) throw new BadRequestException('Student does not belong to institute.');

      try {
        const enrollment = await tx.courseEnrollment.create({
          data: {
            instituteId: dto.instituteId,
            courseId: dto.courseId,
            studentId: dto.studentId,
            enrolledAt: dto.enrolledAt ? new Date(dto.enrolledAt) : new Date(),
            completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
            status: dto.status ?? CourseEnrollmentStatus.ENROLLED,
            progressPct: dto.progressPct !== undefined ? new Prisma.Decimal(dto.progressPct) : new Prisma.Decimal(0),
            lastAccessedAt: dto.lastAccessedAt ? new Date(dto.lastAccessedAt) : null,
            grade: dto.grade ?? null,
          },
        });
        this.logger.log(`CourseEnrollment created: ${enrollment.id}`);
        return enrollment;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Student is already enrolled in this course.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListCourseEnrollmentsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.CourseEnrollmentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.courseEnrollment.count({ where }),
      this.prisma.courseEnrollment.findMany({ where, orderBy: { [query.sortBy ?? 'enrolledAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const enrollment = await this.prisma.courseEnrollment.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!enrollment) throw new NotFoundException(`CourseEnrollment ${id} not found.`);
    return enrollment;
  }

  async update(id: string, dto: UpdateCourseEnrollmentDto) {
    await this.findOne(id);
    return this.prisma.courseEnrollment.update({
      where: { id },
      data: {
        completedAt: dto.completedAt !== undefined ? (dto.completedAt ? new Date(dto.completedAt) : null) : undefined,
        status: dto.status ?? undefined,
        progressPct: dto.progressPct !== undefined ? new Prisma.Decimal(dto.progressPct) : undefined,
        lastAccessedAt: dto.lastAccessedAt !== undefined ? (dto.lastAccessedAt ? new Date(dto.lastAccessedAt) : null) : undefined,
        grade: dto.grade !== undefined ? (dto.grade ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.courseEnrollment.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.courseEnrollment.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`CourseEnrollment ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.courseEnrollment.update({ where: { id }, data: { deletedAt: null } });
  }
}
