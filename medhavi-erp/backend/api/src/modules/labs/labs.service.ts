import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { ListLabsQueryDto } from './dto/list-labs.query';
import { UpdateLabDto } from './dto/update-lab.dto';

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
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLabDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      if (dto.campusId) {
        await this.assertCampusBelongsToInstitute(tx, dto.campusId, dto.instituteId);
      }
      await this.assertCodeUnique(tx, dto.instituteId, dto.code);

      try {
        const lab = await tx.lab.create({
          data: {
            instituteId: dto.instituteId,
            campusId: dto.campusId ?? null,
            building: dto.building ?? null,
            code: dto.code,
            name: dto.name,
            type: dto.type,
            capacity: dto.capacity,
            equipment: dto.equipment !== undefined ? (dto.equipment as Prisma.InputJsonValue) : undefined,
            isActive: dto.isActive ?? true,
          },
        });

        this.logger.log(`Lab created: ${lab.id} (${lab.code})`);
        return lab;
      } catch (err) {
        this.translateUniqueViolation(err);
        throw err;
      }
    });
  }

  async findAll(query: ListLabsQueryDto): Promise<PaginatedResult<Awaited<ReturnType<typeof this.prisma.lab.findFirst>>>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'code';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.LabWhereInput = {
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
      this.prisma.lab.count({ where }),
      this.prisma.lab.findMany({
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
    const lab = await this.prisma.lab.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!lab) {
      throw new NotFoundException(`Lab ${id} not found.`);
    }
    return lab;
  }

  async update(id: string, dto: UpdateLabDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.lab.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Lab ${id} not found.`);
      }

      if (dto.campusId && dto.campusId !== existing.campusId) {
        await this.assertCampusBelongsToInstitute(tx, dto.campusId, existing.instituteId);
      }
      if (dto.code && dto.code !== existing.code) {
        await this.assertCodeUnique(tx, existing.instituteId, dto.code, id);
      }

      try {
        return await tx.lab.update({
          where: { id },
          data: {
            campusId: dto.campusId !== undefined ? (dto.campusId ?? null) : undefined,
            building: dto.building !== undefined ? (dto.building ?? null) : undefined,
            code: dto.code ?? undefined,
            name: dto.name ?? undefined,
            type: dto.type ?? undefined,
            capacity: dto.capacity ?? undefined,
            equipment: dto.equipment !== undefined ? (dto.equipment as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.lab.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.lab.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Lab ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertCodeUnique(tx, existing.instituteId, existing.code, existing.id);

      return tx.lab.update({
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
    const existing = await tx.lab.findFirst({
      where: {
        instituteId,
        code,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictException(`Lab code "${code}" already exists in this institute.`);
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('A lab with the same code already exists in this institute.');
    }
  }
}
