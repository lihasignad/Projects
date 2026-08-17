import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { ListTimeSlotsQueryDto } from './dto/list-time-slots.query';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';

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
export class TimeSlotsService {
  private readonly logger = new Logger(TimeSlotsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTimeSlotDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertSlotOrderUnique(tx, dto.instituteId, dto.slotOrder);
      await this.assertTimeWindowUnique(tx, dto.instituteId, dto.startTime, dto.endTime);

      try {
        const slot = await tx.timeSlot.create({
          data: {
            instituteId: dto.instituteId,
            name: dto.name,
            startTime: dto.startTime,
            endTime: dto.endTime,
            durationMin: dto.durationMin,
            slotOrder: dto.slotOrder,
            isBreak: dto.isBreak ?? false,
            isActive: dto.isActive ?? true,
          },
        });

        this.logger.log(`TimeSlot created: ${slot.id} (${slot.name})`);
        return slot;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListTimeSlotsQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.timeSlot.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'slotOrder';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TimeSlotWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(typeof query.isBreak === 'boolean' ? { isBreak: query.isBreak } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            name: { contains: query.search, mode: 'insensitive' },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.timeSlot.count({ where }),
      this.prisma.timeSlot.findMany({
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
    const slot = await this.prisma.timeSlot.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!slot) {
      throw new NotFoundException(`TimeSlot ${id} not found.`);
    }
    return slot;
  }

  async update(id: string, dto: UpdateTimeSlotDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.timeSlot.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`TimeSlot ${id} not found.`);
      }

      if (dto.slotOrder && dto.slotOrder !== existing.slotOrder) {
        await this.assertSlotOrderUnique(tx, existing.instituteId, dto.slotOrder, id);
      }

      const nextStart = dto.startTime ?? existing.startTime;
      const nextEnd = dto.endTime ?? existing.endTime;
      if (nextStart !== existing.startTime || nextEnd !== existing.endTime) {
        await this.assertTimeWindowUnique(tx, existing.instituteId, nextStart, nextEnd, id);
      }

      try {
        return await tx.timeSlot.update({
          where: { id },
          data: {
            name: dto.name ?? undefined,
            startTime: dto.startTime ?? undefined,
            endTime: dto.endTime ?? undefined,
            durationMin: dto.durationMin ?? undefined,
            slotOrder: dto.slotOrder ?? undefined,
            isBreak: dto.isBreak !== undefined ? dto.isBreak : undefined,
            isActive: dto.isActive !== undefined ? dto.isActive : undefined,
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
    return this.prisma.timeSlot.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.timeSlot.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`TimeSlot ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertSlotOrderUnique(tx, existing.instituteId, existing.slotOrder, existing.id);
      await this.assertTimeWindowUnique(tx, existing.instituteId, existing.startTime, existing.endTime, existing.id);

      return tx.timeSlot.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertSlotOrderUnique(tx: Prisma.TransactionClient, instituteId: string, slotOrder: number, excludeId?: string) {
    const existing = await tx.timeSlot.findFirst({
      where: {
        instituteId,
        slotOrder,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(`TimeSlot with slotOrder ${slotOrder} already exists in this institute.`);
    }
  }

  private async assertTimeWindowUnique(tx: Prisma.TransactionClient, instituteId: string, startTime: string, endTime: string, excludeId?: string) {
    const existing = await tx.timeSlot.findFirst({
      where: {
        instituteId,
        startTime,
        endTime,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(`TimeSlot with time window ${startTime}-${endTime} already exists in this institute.`);
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('A time slot with conflicting order or time window already exists.');
    }
  }
}
