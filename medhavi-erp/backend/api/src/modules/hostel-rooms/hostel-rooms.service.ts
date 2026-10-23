import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateHostelRoomDto } from './dto/create-hostel-room.dto';
import { ListHostelRoomsQueryDto } from './dto/list-hostel-rooms.query';
import { UpdateHostelRoomDto } from './dto/update-hostel-room.dto';

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
export class HostelRoomsService {
  private readonly logger = new Logger(HostelRoomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateHostelRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertRoomNumberUnique(tx, dto.hostelId, dto.roomNumber);

      try {
        const record = await tx.hostelRoom.create({
          data: {
            instituteId: dto.instituteId,
            hostelId: dto.hostelId,
            roomNumber: dto.roomNumber,
            floor: dto.floor ?? undefined,
            capacity: dto.capacity,
            occupied: dto.occupied ?? undefined,
            roomType: dto.roomType ?? undefined,
            monthlyRent: dto.monthlyRent !== undefined ? new Prisma.Decimal(dto.monthlyRent) : undefined,
            isActive: dto.isActive ?? undefined,
          },
        });

        this.logger.log(`HostelRoom created: ${record.id}`);
        return record;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // READ — list with pagination/filters
  // --------------------------------------------------------------------------
  async findAll(
    query: ListHostelRoomsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.hostelRoom.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'roomNumber';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.HostelRoomWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.hostelId ? { hostelId: query.hostelId } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),
      ...(query.search
        ? { roomNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.hostelRoom.count({ where }),
      this.prisma.hostelRoom.findMany({
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

  // --------------------------------------------------------------------------
  // READ — single
  // --------------------------------------------------------------------------
  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const record = await this.prisma.hostelRoom.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`HostelRoom ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateHostelRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostelRoom.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`HostelRoom ${id} not found.`);
      }

      if (dto.roomNumber && dto.roomNumber !== existing.roomNumber) {
        await this.assertRoomNumberUnique(tx, existing.hostelId, dto.roomNumber, id);
      }

      try {
        return await tx.hostelRoom.update({
          where: { id },
          data: {
            hostelId: dto.hostelId ?? undefined,
            roomNumber: dto.roomNumber ?? undefined,
            floor: dto.floor !== undefined ? (dto.floor ?? undefined) : undefined,
            capacity: dto.capacity ?? undefined,
            occupied: dto.occupied !== undefined ? (dto.occupied ?? undefined) : undefined,
            roomType: dto.roomType !== undefined ? (dto.roomType ?? undefined) : undefined,
            monthlyRent: dto.monthlyRent !== undefined ? new Prisma.Decimal(dto.monthlyRent) : undefined,
            isActive: dto.isActive !== undefined ? (dto.isActive ?? undefined) : undefined,
          },
        });
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  // --------------------------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------------------------
  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.hostelRoom.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostelRoom.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`HostelRoom ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertRoomNumberUnique(tx, existing.hostelId, existing.roomNumber, existing.id);

      return tx.hostelRoom.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  // --------------------------------------------------------------------------
  // Internal helpers
  // --------------------------------------------------------------------------
  private async assertInstituteExists(
    tx: Prisma.TransactionClient,
    instituteId: string,
  ) {
    const inst = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!inst) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertRoomNumberUnique(
    tx: Prisma.TransactionClient,
    hostelId: string,
    roomNumber: string,
    excludeId?: string,
  ) {
    const clash = await tx.hostelRoom.findFirst({
      where: {
        hostelId,
        roomNumber,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A HostelRoom with roomNumber "${roomNumber}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A HostelRoom with the same unique fields already exists.',
      );
    }
  }
}
