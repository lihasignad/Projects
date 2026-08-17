import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query';
import { UpdateAttendanceRecordDto } from './dto/update-attendance-record.dto';

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
export class AttendanceRecordsService {
  private readonly logger = new Logger(AttendanceRecordsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttendanceRecordDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertAttendanceSessionBelongsToInstitute(tx, dto.attendanceSessionId, dto.instituteId);
      await this.assertStudentBelongsToInstitute(tx, dto.studentId, dto.instituteId);
      if (dto.markedByUserId) {
        await this.assertUserBelongsToInstitute(tx, dto.markedByUserId, dto.instituteId);
      }

      const existingRecord = await tx.attendanceRecord.findFirst({
        where: {
          attendanceSessionId: dto.attendanceSessionId,
          studentId: dto.studentId,
          deletedAt: null,
        },
      });
      if (existingRecord) {
        throw new ConflictException(`Attendance record already exists for student ${dto.studentId} in this session.`);
      }

      try {
        const record = await tx.attendanceRecord.create({
          data: {
            instituteId: dto.instituteId,
            attendanceSessionId: dto.attendanceSessionId,
            studentId: dto.studentId,
            status: dto.status,
            markedAt: dto.markedAt ? new Date(dto.markedAt) : new Date(),
            markedByUserId: dto.markedByUserId ?? null,
            method: dto.method ?? null,
            remark: dto.remark ?? null,
            geoLat: dto.geoLat !== undefined ? new Prisma.Decimal(dto.geoLat) : undefined,
            geoLng: dto.geoLng !== undefined ? new Prisma.Decimal(dto.geoLng) : undefined,
            deviceFingerprint: dto.deviceFingerprint ?? null,
            ipAddress: dto.ipAddress ?? null,
          },
        });

        this.logger.log(`AttendanceRecord created: ${record.id}`);
        return record;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListAttendanceRecordsQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.attendanceRecord.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.AttendanceRecordWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.attendanceSessionId ? { attendanceSessionId: query.attendanceSessionId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.method ? { method: query.method } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({
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
    const record = await this.prisma.attendanceRecord.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`AttendanceRecord ${id} not found.`);
    }
    return record;
  }

  async update(id: string, dto: UpdateAttendanceRecordDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceRecord.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`AttendanceRecord ${id} not found.`);
      }

      if (dto.markedByUserId && dto.markedByUserId !== existing.markedByUserId) {
        await this.assertUserBelongsToInstitute(tx, dto.markedByUserId, existing.instituteId);
      }

      try {
        return await tx.attendanceRecord.update({
          where: { id },
          data: {
            status: dto.status ?? undefined,
            markedAt: dto.markedAt ? new Date(dto.markedAt) : undefined,
            markedByUserId: dto.markedByUserId !== undefined ? (dto.markedByUserId ?? null) : undefined,
            method: dto.method !== undefined ? (dto.method ?? null) : undefined,
            remark: dto.remark !== undefined ? (dto.remark ?? null) : undefined,
            geoLat: dto.geoLat !== undefined ? (dto.geoLat !== null ? new Prisma.Decimal(dto.geoLat) : null) : undefined,
            geoLng: dto.geoLng !== undefined ? (dto.geoLng !== null ? new Prisma.Decimal(dto.geoLng) : null) : undefined,
            deviceFingerprint: dto.deviceFingerprint !== undefined ? (dto.deviceFingerprint ?? null) : undefined,
            ipAddress: dto.ipAddress !== undefined ? (dto.ipAddress ?? null) : undefined,
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
    return this.prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceRecord.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`AttendanceRecord ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      return tx.attendanceRecord.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertAttendanceSessionBelongsToInstitute(tx: Prisma.TransactionClient, sessionId: string, instituteId: string) {
    const s = await tx.attendanceSession.findFirst({ where: { id: sessionId, deletedAt: null } });
    if (!s) throw new NotFoundException(`AttendanceSession ${sessionId} not found.`);
    if (s.instituteId !== instituteId) throw new BadRequestException(`AttendanceSession ${sessionId} does not belong to institute ${instituteId}.`);
  }

  private async assertStudentBelongsToInstitute(tx: Prisma.TransactionClient, studentId: string, instituteId: string) {
    const st = await tx.student.findFirst({ where: { id: studentId, deletedAt: null } });
    if (!st) throw new NotFoundException(`Student ${studentId} not found.`);
    if (st.instituteId !== instituteId) throw new BadRequestException(`Student ${studentId} does not belong to institute ${instituteId}.`);
  }

  private async assertUserBelongsToInstitute(tx: Prisma.TransactionClient, userId: string, instituteId: string) {
    const u = await tx.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!u) throw new NotFoundException(`User ${userId} not found.`);
    if (u.instituteId && u.instituteId !== instituteId) throw new BadRequestException(`User ${userId} does not belong to institute ${instituteId}.`);
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('An attendance record already exists for this student in this session.');
    }
  }
}
