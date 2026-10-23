import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateHostelAllocationDto } from './dto/create-hostel-allocation.dto';
import { ListHostelAllocationsQueryDto } from './dto/list-hostel-allocations.query';
import { UpdateHostelAllocationDto } from './dto/update-hostel-allocation.dto';

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
export class HostelAllocationsService {
  private readonly logger = new Logger(HostelAllocationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateHostelAllocationDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.hostelAllocation.create({
          data: {
            instituteId: dto.instituteId,
            hostelId: dto.hostelId,
            hostelRoomId: dto.hostelRoomId,
            studentId: dto.studentId,
            academicYearId: dto.academicYearId,
            bedNumber: dto.bedNumber ?? undefined,
            status: dto.status ?? undefined,
            allocatedByUserId: dto.allocatedByUserId ?? undefined,
            notes: dto.notes ?? undefined,
          },
        });

        this.logger.log(`HostelAllocation created: ${record.id}`);
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
    query: ListHostelAllocationsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.hostelAllocation.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.HostelAllocationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.hostelId ? { hostelId: query.hostelId } : {}),
      ...(query.hostelRoomId ? { hostelRoomId: query.hostelRoomId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.status ? { status: query.status } : {}),

    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.hostelAllocation.count({ where }),
      this.prisma.hostelAllocation.findMany({
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
    const record = await this.prisma.hostelAllocation.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`HostelAllocation ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateHostelAllocationDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostelAllocation.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`HostelAllocation ${id} not found.`);
      }



      try {
        return await tx.hostelAllocation.update({
          where: { id },
          data: {
            hostelId: dto.hostelId ?? undefined,
            hostelRoomId: dto.hostelRoomId ?? undefined,
            studentId: dto.studentId ?? undefined,
            academicYearId: dto.academicYearId ?? undefined,
            bedNumber: dto.bedNumber !== undefined ? (dto.bedNumber ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            allocatedByUserId: dto.allocatedByUserId !== undefined ? (dto.allocatedByUserId ?? undefined) : undefined,
            notes: dto.notes !== undefined ? (dto.notes ?? undefined) : undefined,
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
    return this.prisma.hostelAllocation.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostelAllocation.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`HostelAllocation ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.hostelAllocation.update({
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


  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A HostelAllocation with the same unique fields already exists.',
      );
    }
  }
}
