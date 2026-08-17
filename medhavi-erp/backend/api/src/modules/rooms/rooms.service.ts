import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { ListRoomsQueryDto } from './dto/list-rooms.query';
import { UpdateRoomDto } from './dto/update-room.dto';

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
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      if (dto.campusId) {
        await this.assertCampusBelongsToInstitute(tx, dto.campusId, dto.instituteId);
      }
      await this.assertCodeUnique(tx, dto.instituteId, dto.code);

      try {
        const room = await tx.room.create({
          data: {
            instituteId: dto.instituteId,
            campusId: dto.campusId ?? null,
            building: dto.building ?? null,
            code: dto.code,
            name: dto.name,
            type: dto.type,
            capacity: dto.capacity,
            floor: dto.floor ?? null,
            hasProjector: dto.hasProjector ?? false,
            hasAc: dto.hasAc ?? false,
            isActive: dto.isActive ?? true,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Room created: ${room.id} (${room.code})`);
        return room;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListRoomsQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.room.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'code';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.RoomWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
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
    const room = await this.prisma.room.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!room) {
      throw new NotFoundException(`Room ${id} not found.`);
    }
    return room;
  }

  async update(id: string, dto: UpdateRoomDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.room.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Room ${id} not found.`);
      }

      if (dto.campusId && dto.campusId !== existing.campusId) {
        await this.assertCampusBelongsToInstitute(tx, dto.campusId, existing.instituteId);
      }
      if (dto.code && dto.code !== existing.code) {
        await this.assertCodeUnique(tx, existing.instituteId, dto.code, id);
      }

      try {
        return await tx.room.update({
          where: { id },
          data: {
            campusId: dto.campusId !== undefined ? (dto.campusId ?? null) : undefined,
            building: dto.building !== undefined ? (dto.building ?? null) : undefined,
            code: dto.code ?? undefined,
            name: dto.name ?? undefined,
            type: dto.type ?? undefined,
            capacity: dto.capacity ?? undefined,
            floor: dto.floor !== undefined ? (dto.floor ?? null) : undefined,
            hasProjector: dto.hasProjector !== undefined ? dto.hasProjector : undefined,
            hasAc: dto.hasAc !== undefined ? dto.hasAc : undefined,
            isActive: dto.isActive !== undefined ? dto.isActive : undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.room.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.room.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Room ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertCodeUnique(tx, existing.instituteId, existing.code, existing.id);

      return tx.room.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    });
  }

  private async assertInstituteExists(tx: Prisma.TransactionClient, instituteId: string) {
    const inst = await tx.institute.findFirst({ where: { id: instituteId, deletedAt: null } });
    if (!inst) throw new NotFoundException(`Institute ${instituteId} not found.`);
  }

  private async assertCampusBelongsToInstitute(tx: Prisma.TransactionClient, campusId: string, instituteId: string) {
    const camp = await tx.campus.findFirst({ where: { id: campusId, deletedAt: null } });
    if (!camp) throw new NotFoundException(`Campus ${campusId} not found.`);
    if (camp.instituteId !== instituteId) throw new BadRequestException(`Campus ${campusId} does not belong to institute ${instituteId}.`);
  }

  private async assertCodeUnique(tx: Prisma.TransactionClient, instituteId: string, code: string, excludeId?: string) {
    const existing = await tx.room.findFirst({
      where: {
        instituteId,
        code,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(`Room code "${code}" already exists in this institute.`);
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('A room with the same code already exists in this institute.');
    }
  }
}
