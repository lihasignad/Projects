import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateHostelLeaveRequestDto } from './dto/create-hostel-leave-request.dto';
import { ListHostelLeaveRequestsQueryDto } from './dto/list-hostel-leave-requests.query';
import { UpdateHostelLeaveRequestDto } from './dto/update-hostel-leave-request.dto';

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
export class HostelLeaveRequestsService {
  private readonly logger = new Logger(HostelLeaveRequestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateHostelLeaveRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.hostelLeaveRequest.create({
          data: {
            instituteId: dto.instituteId,
            hostelId: dto.hostelId,
            studentId: dto.studentId,
            fromDate: dto.fromDate,
            toDate: dto.toDate,
            reason: dto.reason,
            destination: dto.destination ?? undefined,
            emergencyContact: dto.emergencyContact ?? undefined,
            status: dto.status ?? undefined,
          },
        });

        this.logger.log(`HostelLeaveRequest created: ${record.id}`);
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
    query: ListHostelLeaveRequestsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.hostelLeaveRequest.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.HostelLeaveRequestWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.hostelId ? { hostelId: query.hostelId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { reason: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.hostelLeaveRequest.count({ where }),
      this.prisma.hostelLeaveRequest.findMany({
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
    const record = await this.prisma.hostelLeaveRequest.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`HostelLeaveRequest ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateHostelLeaveRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostelLeaveRequest.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`HostelLeaveRequest ${id} not found.`);
      }



      try {
        return await tx.hostelLeaveRequest.update({
          where: { id },
          data: {
            hostelId: dto.hostelId ?? undefined,
            studentId: dto.studentId ?? undefined,
            fromDate: dto.fromDate ?? undefined,
            toDate: dto.toDate ?? undefined,
            reason: dto.reason ?? undefined,
            destination: dto.destination !== undefined ? (dto.destination ?? undefined) : undefined,
            emergencyContact: dto.emergencyContact !== undefined ? (dto.emergencyContact ?? undefined) : undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
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
    return this.prisma.hostelLeaveRequest.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.hostelLeaveRequest.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`HostelLeaveRequest ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.hostelLeaveRequest.update({
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
        'A HostelLeaveRequest with the same unique fields already exists.',
      );
    }
  }
}
