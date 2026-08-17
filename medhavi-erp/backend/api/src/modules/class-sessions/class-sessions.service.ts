import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClassSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { ListClassSessionsQueryDto } from './dto/list-class-sessions.query';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';

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
export class ClassSessionsService {
  private readonly logger = new Logger(ClassSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertSubjectOfferingBelongsToInstitute(tx, dto.subjectOfferingId, dto.instituteId);
      await this.assertFacultyBelongsToInstitute(tx, dto.facultyId, dto.instituteId);
      await this.assertSectionBelongsToInstitute(tx, dto.sectionId, dto.instituteId);
      if (dto.timetableEntryId) {
        await this.assertTimetableEntryBelongsToInstitute(tx, dto.timetableEntryId, dto.instituteId);
      }
      if (dto.roomId) {
        await this.assertRoomBelongsToInstitute(tx, dto.roomId, dto.instituteId);
      }
      if (dto.labId) {
        await this.assertLabBelongsToInstitute(tx, dto.labId, dto.instituteId);
      }
      if (dto.rescheduledToId) {
        await this.assertClassSessionBelongsToInstitute(tx, dto.rescheduledToId, dto.instituteId);
      }

      this.assertTimeWindow(dto.startAt, dto.endAt);

      try {
        const session = await tx.classSession.create({
          data: {
            instituteId: dto.instituteId,
            timetableEntryId: dto.timetableEntryId ?? null,
            subjectOfferingId: dto.subjectOfferingId,
            facultyId: dto.facultyId,
            sectionId: dto.sectionId,
            roomId: dto.roomId ?? null,
            labId: dto.labId ?? null,
            sessionDate: new Date(dto.sessionDate),
            startAt: new Date(dto.startAt),
            endAt: new Date(dto.endAt),
            entryType: dto.entryType,
            deliveryMode: dto.deliveryMode ?? undefined,
            status: dto.status ?? ClassSessionStatus.SCHEDULED,
            topic: dto.topic ?? null,
            summary: dto.summary ?? null,
            cancellationReason: dto.cancellationReason ?? null,
            rescheduledToId: dto.rescheduledToId ?? null,
            meetingUrl: dto.meetingUrl ?? null,
            meetingRecordingUrl: dto.meetingRecordingUrl ?? null,
          },
        });

        this.logger.log(`ClassSession created: ${session.id}`);
        return session;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListClassSessionsQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.classSession.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'sessionDate';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ClassSessionWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.timetableEntryId ? { timetableEntryId: query.timetableEntryId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.facultyId ? { facultyId: query.facultyId } : {}),
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.labId ? { labId: query.labId } : {}),
      ...(query.sessionDate ? { sessionDate: new Date(query.sessionDate) } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.entryType ? { entryType: query.entryType } : {}),
      ...(query.deliveryMode ? { deliveryMode: query.deliveryMode } : {}),
      ...(query.search
        ? {
            OR: [
              { topic: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.classSession.count({ where }),
      this.prisma.classSession.findMany({
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
    const session = await this.prisma.classSession.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!session) {
      throw new NotFoundException(`ClassSession ${id} not found.`);
    }
    return session;
  }

  async update(id: string, dto: UpdateClassSessionDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.classSession.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`ClassSession ${id} not found.`);
      }

      if (dto.subjectOfferingId && dto.subjectOfferingId !== existing.subjectOfferingId) {
        await this.assertSubjectOfferingBelongsToInstitute(tx, dto.subjectOfferingId, existing.instituteId);
      }
      if (dto.facultyId && dto.facultyId !== existing.facultyId) {
        await this.assertFacultyBelongsToInstitute(tx, dto.facultyId, existing.instituteId);
      }
      if (dto.sectionId && dto.sectionId !== existing.sectionId) {
        await this.assertSectionBelongsToInstitute(tx, dto.sectionId, existing.instituteId);
      }
      if (dto.roomId !== undefined && dto.roomId !== existing.roomId && dto.roomId !== null) {
        await this.assertRoomBelongsToInstitute(tx, dto.roomId, existing.instituteId);
      }
      if (dto.labId !== undefined && dto.labId !== existing.labId && dto.labId !== null) {
        await this.assertLabBelongsToInstitute(tx, dto.labId, existing.instituteId);
      }
      if (dto.rescheduledToId !== undefined && dto.rescheduledToId !== existing.rescheduledToId && dto.rescheduledToId !== null) {
        await this.assertClassSessionBelongsToInstitute(tx, dto.rescheduledToId, existing.instituteId);
      }

      const nextStart = dto.startAt ? new Date(dto.startAt) : existing.startAt;
      const nextEnd = dto.endAt ? new Date(dto.endAt) : existing.endAt;
      this.assertTimeWindow(nextStart, nextEnd);

      try {
        return await tx.classSession.update({
          where: { id },
          data: {
            timetableEntryId: dto.timetableEntryId !== undefined ? (dto.timetableEntryId ?? null) : undefined,
            subjectOfferingId: dto.subjectOfferingId ?? undefined,
            facultyId: dto.facultyId ?? undefined,
            sectionId: dto.sectionId ?? undefined,
            roomId: dto.roomId !== undefined ? (dto.roomId ?? null) : undefined,
            labId: dto.labId !== undefined ? (dto.labId ?? null) : undefined,
            sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : undefined,
            startAt: dto.startAt ? new Date(dto.startAt) : undefined,
            endAt: dto.endAt ? new Date(dto.endAt) : undefined,
            entryType: dto.entryType ?? undefined,
            deliveryMode: dto.deliveryMode ?? undefined,
            status: dto.status ?? undefined,
            topic: dto.topic !== undefined ? (dto.topic ?? null) : undefined,
            summary: dto.summary !== undefined ? (dto.summary ?? null) : undefined,
            cancellationReason: dto.cancellationReason !== undefined ? (dto.cancellationReason ?? null) : undefined,
            rescheduledToId: dto.rescheduledToId !== undefined ? (dto.rescheduledToId ?? null) : undefined,
            meetingUrl: dto.meetingUrl !== undefined ? (dto.meetingUrl ?? null) : undefined,
            meetingRecordingUrl: dto.meetingRecordingUrl !== undefined ? (dto.meetingRecordingUrl ?? null) : undefined,
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
    return this.prisma.classSession.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.classSession.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`ClassSession ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      return tx.classSession.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertSubjectOfferingBelongsToInstitute(tx: Prisma.TransactionClient, subjectOfferingId: string, instituteId: string) {
    const so = await tx.subjectOffering.findFirst({ where: { id: subjectOfferingId, deletedAt: null } });
    if (!so) throw new NotFoundException(`SubjectOffering ${subjectOfferingId} not found.`);
    if (so.instituteId !== instituteId) throw new BadRequestException(`SubjectOffering ${subjectOfferingId} does not belong to institute ${instituteId}.`);
  }

  private async assertFacultyBelongsToInstitute(tx: Prisma.TransactionClient, facultyId: string, instituteId: string) {
    const f = await tx.faculty.findFirst({ where: { id: facultyId, deletedAt: null } });
    if (!f) throw new NotFoundException(`Faculty ${facultyId} not found.`);
    if (f.instituteId !== instituteId) throw new BadRequestException(`Faculty ${facultyId} does not belong to institute ${instituteId}.`);
  }

  private async assertSectionBelongsToInstitute(tx: Prisma.TransactionClient, sectionId: string, instituteId: string) {
    const s = await tx.section.findFirst({ where: { id: sectionId, deletedAt: null } });
    if (!s) throw new NotFoundException(`Section ${sectionId} not found.`);
    if (s.instituteId !== instituteId) throw new BadRequestException(`Section ${sectionId} does not belong to institute ${instituteId}.`);
  }

  private async assertTimetableEntryBelongsToInstitute(tx: Prisma.TransactionClient, entryId: string, instituteId: string) {
    const te = await tx.timetableEntry.findFirst({ where: { id: entryId, deletedAt: null } });
    if (!te) throw new NotFoundException(`TimetableEntry ${entryId} not found.`);
    if (te.instituteId !== instituteId) throw new BadRequestException(`TimetableEntry ${entryId} does not belong to institute ${instituteId}.`);
  }

  private async assertRoomBelongsToInstitute(tx: Prisma.TransactionClient, roomId: string, instituteId: string) {
    const r = await tx.room.findFirst({ where: { id: roomId, deletedAt: null } });
    if (!r) throw new NotFoundException(`Room ${roomId} not found.`);
    if (r.instituteId !== instituteId) throw new BadRequestException(`Room ${roomId} does not belong to institute ${instituteId}.`);
  }

  private async assertLabBelongsToInstitute(tx: Prisma.TransactionClient, labId: string, instituteId: string) {
    const l = await tx.lab.findFirst({ where: { id: labId, deletedAt: null } });
    if (!l) throw new NotFoundException(`Lab ${labId} not found.`);
    if (l.instituteId !== instituteId) throw new BadRequestException(`Lab ${labId} does not belong to institute ${instituteId}.`);
  }

  private async assertClassSessionBelongsToInstitute(tx: Prisma.TransactionClient, sessionId: string, instituteId: string) {
    const cs = await tx.classSession.findFirst({ where: { id: sessionId, deletedAt: null } });
    if (!cs) throw new NotFoundException(`ClassSession ${sessionId} not found.`);
    if (cs.instituteId !== instituteId) throw new BadRequestException(`ClassSession ${sessionId} does not belong to institute ${instituteId}.`);
  }

  private assertTimeWindow(start: Date, end: Date) {
    if (new Date(start).getTime() >= new Date(end).getTime()) {
      throw new BadRequestException('startAt must be strictly before endAt.');
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('A class session unique constraint was violated.');
    }
  }
}
