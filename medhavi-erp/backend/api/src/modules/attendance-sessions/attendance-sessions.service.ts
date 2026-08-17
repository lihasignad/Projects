import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { ListAttendanceSessionsQueryDto } from './dto/list-attendance-sessions.query';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class AttendanceSessionsService {
  private readonly logger = new Logger(AttendanceSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendanceSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertClassSessionBelongsToInstitute(tx, dto.classSessionId, dto.instituteId);
      await this.assertSubjectOfferingBelongsToInstitute(tx, dto.subjectOfferingId, dto.instituteId);
      await this.assertSectionBelongsToInstitute(tx, dto.sectionId, dto.instituteId);
      await this.assertFacultyBelongsToInstitute(tx, dto.facultyId, dto.instituteId);

      const existingForClass = await tx.attendanceSession.findFirst({
        where: { classSessionId: dto.classSessionId, deletedAt: null },
      });
      if (existingForClass) {
        throw new ConflictException(`Attendance session already exists for classSession ${dto.classSessionId}.`);
      }

      try {
        const session = await tx.attendanceSession.create({
          data: {
            instituteId: dto.instituteId,
            classSessionId: dto.classSessionId,
            subjectOfferingId: dto.subjectOfferingId,
            sectionId: dto.sectionId,
            facultyId: dto.facultyId,
            sessionDate: new Date(dto.sessionDate),
            openedAt: dto.openedAt ? new Date(dto.openedAt) : null,
            closedAt: dto.closedAt ? new Date(dto.closedAt) : null,
            method: dto.method,
            status: dto.status ?? AttendanceSessionStatus.OPEN,
            qrToken: dto.qrToken ?? null,
            qrExpiresAt: dto.qrExpiresAt ? new Date(dto.qrExpiresAt) : null,
            geoLat: dto.geoLat !== undefined ? new Prisma.Decimal(dto.geoLat) : undefined,
            geoLng: dto.geoLng !== undefined ? new Prisma.Decimal(dto.geoLng) : undefined,
            geoRadiusM: dto.geoRadiusM ?? null,
            notes: dto.notes ?? null,
          },
        });

        this.logger.log(`AttendanceSession created: ${session.id}`);
        return session;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListAttendanceSessionsQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.attendanceSession.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'sessionDate';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.AttendanceSessionWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.classSessionId ? { classSessionId: query.classSessionId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.facultyId ? { facultyId: query.facultyId } : {}),
      ...(query.sessionDate ? { sessionDate: new Date(query.sessionDate) } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.method ? { method: query.method } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendanceSession.count({ where }),
      this.prisma.attendanceSession.findMany({
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

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const session = await this.prisma.attendanceSession.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!session) {
      throw new NotFoundException(`AttendanceSession ${id} not found.`);
    }
    return session;
  }

  async update(id: string, dto: UpdateAttendanceSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceSession.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`AttendanceSession ${id} not found.`);
      }

      if (dto.subjectOfferingId && dto.subjectOfferingId !== existing.subjectOfferingId) {
        await this.assertSubjectOfferingBelongsToInstitute(tx, dto.subjectOfferingId, existing.instituteId);
      }
      if (dto.sectionId && dto.sectionId !== existing.sectionId) {
        await this.assertSectionBelongsToInstitute(tx, dto.sectionId, existing.instituteId);
      }
      if (dto.facultyId && dto.facultyId !== existing.facultyId) {
        await this.assertFacultyBelongsToInstitute(tx, dto.facultyId, existing.instituteId);
      }

      try {
        return await tx.attendanceSession.update({
          where: { id },
          data: {
            subjectOfferingId: dto.subjectOfferingId ?? undefined,
            sectionId: dto.sectionId ?? undefined,
            facultyId: dto.facultyId ?? undefined,
            sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : undefined,
            openedAt: dto.openedAt !== undefined ? (dto.openedAt ? new Date(dto.openedAt) : null) : undefined,
            closedAt: dto.closedAt !== undefined ? (dto.closedAt ? new Date(dto.closedAt) : null) : undefined,
            method: dto.method ?? undefined,
            status: dto.status ?? undefined,
            qrToken: dto.qrToken !== undefined ? (dto.qrToken ?? null) : undefined,
            qrExpiresAt: dto.qrExpiresAt !== undefined ? (dto.qrExpiresAt ? new Date(dto.qrExpiresAt) : null) : undefined,
            geoLat: dto.geoLat !== undefined ? (dto.geoLat !== null ? new Prisma.Decimal(dto.geoLat) : null) : undefined,
            geoLng: dto.geoLng !== undefined ? (dto.geoLng !== null ? new Prisma.Decimal(dto.geoLng) : null) : undefined,
            geoRadiusM: dto.geoRadiusM !== undefined ? (dto.geoRadiusM ?? null) : undefined,
            notes: dto.notes !== undefined ? (dto.notes ?? null) : undefined,
          },
        });
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.attendanceSession.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceSession.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`AttendanceSession ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      return tx.attendanceSession.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertClassSessionBelongsToInstitute(tx: Prisma.TransactionClient, classSessionId: string, instituteId: string) {
    const cs = await tx.classSession.findFirst({ where: { id: classSessionId, deletedAt: null } });
    if (!cs) throw new NotFoundException(`ClassSession ${classSessionId} not found.`);
    if (cs.instituteId !== instituteId) throw new BadRequestException(`ClassSession ${classSessionId} does not belong to institute ${instituteId}.`);
  }

  private async assertSubjectOfferingBelongsToInstitute(tx: Prisma.TransactionClient, subjectOfferingId: string, instituteId: string) {
    const so = await tx.subjectOffering.findFirst({ where: { id: subjectOfferingId, deletedAt: null } });
    if (!so) throw new NotFoundException(`SubjectOffering ${subjectOfferingId} not found.`);
    if (so.instituteId !== instituteId) throw new BadRequestException(`SubjectOffering ${subjectOfferingId} does not belong to institute ${instituteId}.`);
  }

  private async assertSectionBelongsToInstitute(tx: Prisma.TransactionClient, sectionId: string, instituteId: string) {
    const sec = await tx.section.findFirst({ where: { id: sectionId, deletedAt: null } });
    if (!sec) throw new NotFoundException(`Section ${sectionId} not found.`);
    if (sec.instituteId !== instituteId) throw new BadRequestException(`Section ${sectionId} does not belong to institute ${instituteId}.`);
  }

  private async assertFacultyBelongsToInstitute(tx: Prisma.TransactionClient, facultyId: string, instituteId: string) {
    const f = await tx.faculty.findFirst({ where: { id: facultyId, deletedAt: null } });
    if (!f) throw new NotFoundException(`Faculty ${facultyId} not found.`);
    if (f.instituteId !== instituteId) throw new BadRequestException(`Faculty ${facultyId} does not belong to institute ${instituteId}.`);
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('An attendance session with unique constraint already exists.');
    }
  }
}
