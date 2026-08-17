import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MentorshipStatus, MentorshipType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateMentorshipDto } from './dto/create-mentorship.dto';
import { ListMentorshipsQueryDto } from './dto/list-mentorships.query';
import { UpdateMentorshipDto } from './dto/update-mentorship.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class MentorshipsService {
  private readonly logger = new Logger(MentorshipsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMentorshipDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);

      const fac = await tx.faculty.findFirst({ where: { id: dto.mentorFacultyId, deletedAt: null } });
      if (!fac) throw new NotFoundException(`Faculty ${dto.mentorFacultyId} not found.`);
      if (fac.instituteId !== dto.instituteId) throw new BadRequestException('Faculty does not belong to institute.');

      const st = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!st) throw new NotFoundException(`Student ${dto.studentId} not found.`);
      if (st.instituteId !== dto.instituteId) throw new BadRequestException('Student does not belong to institute.');

      if (dto.academicYearId) {
        const ay = await tx.academicYear.findFirst({ where: { id: dto.academicYearId, deletedAt: null } });
        if (!ay) throw new NotFoundException(`AcademicYear ${dto.academicYearId} not found.`);
      }
      if (dto.assignedByUserId) {
        const u = await tx.user.findFirst({ where: { id: dto.assignedByUserId, deletedAt: null } });
        if (!u) throw new NotFoundException(`User ${dto.assignedByUserId} not found.`);
      }

      try {
        const ms = await tx.mentorship.create({
          data: {
            instituteId: dto.instituteId,
            mentorFacultyId: dto.mentorFacultyId,
            studentId: dto.studentId,
            type: dto.type ?? MentorshipType.ACADEMIC,
            academicYearId: dto.academicYearId ?? null,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            status: dto.status ?? MentorshipStatus.REQUESTED,
            goals: dto.goals ?? null,
            meetingCadence: dto.meetingCadence ?? null,
            lastInteractionAt: dto.lastInteractionAt ? new Date(dto.lastInteractionAt) : null,
            interactionCount: dto.interactionCount ?? 0,
            rating: dto.rating !== undefined ? new Prisma.Decimal(dto.rating) : null,
            feedback: dto.feedback ?? null,
            assignedByUserId: dto.assignedByUserId ?? null,
            closedReason: dto.closedReason ?? null,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });
        this.logger.log(`Mentorship created: ${ms.id}`);
        return ms;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Mentorship record already exists for this mentor, student, type and academic year.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListMentorshipsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.MentorshipWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.mentorFacultyId ? { mentorFacultyId: query.mentorFacultyId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.mentorship.count({ where }),
      this.prisma.mentorship.findMany({ where, orderBy: { [query.sortBy ?? 'startDate']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const ms = await this.prisma.mentorship.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!ms) throw new NotFoundException(`Mentorship ${id} not found.`);
    return ms;
  }

  async update(id: string, dto: UpdateMentorshipDto) {
    await this.findOne(id);
    return this.prisma.mentorship.update({
      where: { id },
      data: {
        type: dto.type ?? undefined,
        academicYearId: dto.academicYearId !== undefined ? (dto.academicYearId ?? null) : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        status: dto.status ?? undefined,
        goals: dto.goals !== undefined ? (dto.goals ?? null) : undefined,
        meetingCadence: dto.meetingCadence !== undefined ? (dto.meetingCadence ?? null) : undefined,
        lastInteractionAt: dto.lastInteractionAt !== undefined ? (dto.lastInteractionAt ? new Date(dto.lastInteractionAt) : null) : undefined,
        interactionCount: dto.interactionCount ?? undefined,
        rating: dto.rating !== undefined ? (dto.rating !== null ? new Prisma.Decimal(dto.rating) : null) : undefined,
        feedback: dto.feedback !== undefined ? (dto.feedback ?? null) : undefined,
        assignedByUserId: dto.assignedByUserId !== undefined ? (dto.assignedByUserId ?? null) : undefined,
        closedReason: dto.closedReason !== undefined ? (dto.closedReason ?? null) : undefined,
        metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.mentorship.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.mentorship.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Mentorship ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.mentorship.update({ where: { id }, data: { deletedAt: null } });
  }
}
