import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTimetableEntryDto } from './dto/create-timetable-entry.dto';
import { ListTimetableEntriesQueryDto } from './dto/list-timetable-entries.query';
import { UpdateTimetableEntryDto } from './dto/update-timetable-entry.dto';

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
export class TimetableEntriesService {
  private readonly logger = new Logger(TimetableEntriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimetableEntryDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertTimetableBelongsToInstitute(tx, dto.timetableId, dto.instituteId);
      await this.assertSubjectOfferingBelongsToInstitute(tx, dto.subjectOfferingId, dto.instituteId);
      await this.assertFacultyBelongsToInstitute(tx, dto.primaryFacultyId, dto.instituteId);
      await this.assertTimeSlotBelongsToInstitute(tx, dto.timeSlotId, dto.instituteId);
      if (dto.roomId) {
        await this.assertRoomBelongsToInstitute(tx, dto.roomId, dto.instituteId);
      }
      if (dto.labId) {
        await this.assertLabBelongsToInstitute(tx, dto.labId, dto.instituteId);
      }

      const weekParity = dto.weekParity ?? null;
      const clash = await tx.timetableEntry.findFirst({
        where: {
          timetableId: dto.timetableId,
          dayOfWeek: dto.dayOfWeek,
          timeSlotId: dto.timeSlotId,
          weekParity,
          deletedAt: null,
        },
      });
      if (clash) {
        throw new ConflictException('A timetable entry already exists for this slot and day in the timetable.');
      }

      try {
        const entry = await tx.timetableEntry.create({
          data: {
            instituteId: dto.instituteId,
            timetableId: dto.timetableId,
            subjectOfferingId: dto.subjectOfferingId,
            facultyAssignmentId: dto.facultyAssignmentId ?? null,
            primaryFacultyId: dto.primaryFacultyId,
            dayOfWeek: dto.dayOfWeek,
            timeSlotId: dto.timeSlotId,
            roomId: dto.roomId ?? null,
            labId: dto.labId ?? null,
            entryType: dto.entryType,
            deliveryMode: dto.deliveryMode ?? undefined,
            meetingUrl: dto.meetingUrl ?? null,
            weekParity,
            notes: dto.notes ?? null,
          },
        });

        this.logger.log(`TimetableEntry created: ${entry.id}`);
        return entry;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListTimetableEntriesQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.timetableEntry.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'dayOfWeek';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TimetableEntryWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.timetableId ? { timetableId: query.timetableId } : {}),
      ...(query.subjectOfferingId ? { subjectOfferingId: query.subjectOfferingId } : {}),
      ...(query.primaryFacultyId ? { primaryFacultyId: query.primaryFacultyId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.labId ? { labId: query.labId } : {}),
      ...(query.timeSlotId ? { timeSlotId: query.timeSlotId } : {}),
      ...(query.dayOfWeek ? { dayOfWeek: query.dayOfWeek } : {}),
      ...(query.entryType ? { entryType: query.entryType } : {}),
      ...(query.deliveryMode ? { deliveryMode: query.deliveryMode } : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.timetableEntry.count({ where }),
      this.prisma.timetableEntry.findMany({
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
    const entry = await this.prisma.timetableEntry.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!entry) {
      throw new NotFoundException(`TimetableEntry ${id} not found.`);
    }
    return entry;
  }

  async update(id: string, dto: UpdateTimetableEntryDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.timetableEntry.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`TimetableEntry ${id} not found.`);
      }

      if (dto.subjectOfferingId && dto.subjectOfferingId !== existing.subjectOfferingId) {
        await this.assertSubjectOfferingBelongsToInstitute(tx, dto.subjectOfferingId, existing.instituteId);
      }
      if (dto.primaryFacultyId && dto.primaryFacultyId !== existing.primaryFacultyId) {
        await this.assertFacultyBelongsToInstitute(tx, dto.primaryFacultyId, existing.instituteId);
      }
      if (dto.timeSlotId && dto.timeSlotId !== existing.timeSlotId) {
        await this.assertTimeSlotBelongsToInstitute(tx, dto.timeSlotId, existing.instituteId);
      }
      if (dto.roomId !== undefined && dto.roomId !== existing.roomId && dto.roomId !== null) {
        await this.assertRoomBelongsToInstitute(tx, dto.roomId, existing.instituteId);
      }
      if (dto.labId !== undefined && dto.labId !== existing.labId && dto.labId !== null) {
        await this.assertLabBelongsToInstitute(tx, dto.labId, existing.instituteId);
      }

      try {
        return await tx.timetableEntry.update({
          where: { id },
          data: {
            subjectOfferingId: dto.subjectOfferingId ?? undefined,
            facultyAssignmentId: dto.facultyAssignmentId !== undefined ? (dto.facultyAssignmentId ?? null) : undefined,
            primaryFacultyId: dto.primaryFacultyId ?? undefined,
            dayOfWeek: dto.dayOfWeek ?? undefined,
            timeSlotId: dto.timeSlotId ?? undefined,
            roomId: dto.roomId !== undefined ? (dto.roomId ?? null) : undefined,
            labId: dto.labId !== undefined ? (dto.labId ?? null) : undefined,
            entryType: dto.entryType ?? undefined,
            deliveryMode: dto.deliveryMode ?? undefined,
            meetingUrl: dto.meetingUrl !== undefined ? (dto.meetingUrl ?? null) : undefined,
            weekParity: dto.weekParity !== undefined ? (dto.weekParity ?? null) : undefined,
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
    return this.prisma.timetableEntry.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.timetableEntry.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`TimetableEntry ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      return tx.timetableEntry.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertTimetableBelongsToInstitute(tx: Prisma.TransactionClient, timetableId: string, instituteId: string) {
    const t = await tx.timetable.findFirst({ where: { id: timetableId, deletedAt: null } });
    if (!t) throw new NotFoundException(`Timetable ${timetableId} not found.`);
    if (t.instituteId !== instituteId) throw new BadRequestException(`Timetable ${timetableId} does not belong to institute ${instituteId}.`);
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

  private async assertTimeSlotBelongsToInstitute(tx: Prisma.TransactionClient, timeSlotId: string, instituteId: string) {
    const ts = await tx.timeSlot.findFirst({ where: { id: timeSlotId, deletedAt: null } });
    if (!ts) throw new NotFoundException(`TimeSlot ${timeSlotId} not found.`);
    if (ts.instituteId !== instituteId) throw new BadRequestException(`TimeSlot ${timeSlotId} does not belong to institute ${instituteId}.`);
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

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('A timetable entry with this slot, day, and parity already exists in the timetable.');
    }
  }
}
