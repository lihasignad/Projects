import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InvigilationRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateInvigilationAssignmentDto } from './dto/create-invigilation-assignment.dto';
import { ListInvigilationAssignmentsQueryDto } from './dto/list-invigilation-assignments.query';
import { UpdateInvigilationAssignmentDto } from './dto/update-invigilation-assignment.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class InvigilationAssignmentsService {
  private readonly logger = new Logger(InvigilationAssignmentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvigilationAssignmentDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);
      const es = await tx.examSchedule.findFirst({ where: { id: dto.examScheduleId, deletedAt: null } });
      if (!es) throw new NotFoundException(`ExamSchedule ${dto.examScheduleId} not found.`);
      if (es.instituteId !== dto.instituteId) throw new BadRequestException('ExamSchedule does not belong to institute.');
      
      const fac = await tx.faculty.findFirst({ where: { id: dto.facultyId, deletedAt: null } });
      if (!fac) throw new NotFoundException(`Faculty ${dto.facultyId} not found.`);
      if (fac.instituteId !== dto.instituteId) throw new BadRequestException('Faculty does not belong to institute.');

      if (dto.roomId) {
        const rm = await tx.room.findFirst({ where: { id: dto.roomId, deletedAt: null } });
        if (!rm) throw new NotFoundException(`Room ${dto.roomId} not found.`);
      }

      try {
        const assignment = await tx.invigilationAssignment.create({
          data: {
            instituteId: dto.instituteId,
            examScheduleId: dto.examScheduleId,
            facultyId: dto.facultyId,
            roomId: dto.roomId ?? null,
            role: dto.role ?? InvigilationRole.ASSISTANT,
            reportingAt: new Date(dto.reportingAt),
            releasedAt: dto.releasedAt ? new Date(dto.releasedAt) : null,
            acknowledged: dto.acknowledged ?? false,
            acknowledgedAt: dto.acknowledgedAt ? new Date(dto.acknowledgedAt) : null,
            notes: dto.notes ?? null,
          },
        });
        this.logger.log(`InvigilationAssignment created: ${assignment.id}`);
        return assignment;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Faculty is already assigned to this exam schedule.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListInvigilationAssignmentsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.InvigilationAssignmentWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.examScheduleId ? { examScheduleId: query.examScheduleId } : {}),
      ...(query.facultyId ? { facultyId: query.facultyId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(typeof query.acknowledged === 'boolean' ? { acknowledged: query.acknowledged } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.invigilationAssignment.count({ where }),
      this.prisma.invigilationAssignment.findMany({ where, orderBy: { [query.sortBy ?? 'reportingAt']: query.sortOrder ?? 'asc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const assignment = await this.prisma.invigilationAssignment.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!assignment) throw new NotFoundException(`InvigilationAssignment ${id} not found.`);
    return assignment;
  }

  async update(id: string, dto: UpdateInvigilationAssignmentDto) {
    await this.findOne(id);
    return this.prisma.invigilationAssignment.update({
      where: { id },
      data: {
        roomId: dto.roomId !== undefined ? (dto.roomId ?? null) : undefined,
        role: dto.role ?? undefined,
        reportingAt: dto.reportingAt ? new Date(dto.reportingAt) : undefined,
        releasedAt: dto.releasedAt !== undefined ? (dto.releasedAt ? new Date(dto.releasedAt) : null) : undefined,
        acknowledged: dto.acknowledged !== undefined ? dto.acknowledged : undefined,
        acknowledgedAt: dto.acknowledgedAt !== undefined ? (dto.acknowledgedAt ? new Date(dto.acknowledgedAt) : null) : undefined,
        notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.invigilationAssignment.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.invigilationAssignment.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`InvigilationAssignment ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.invigilationAssignment.update({ where: { id }, data: { deletedAt: null } });
  }
}
