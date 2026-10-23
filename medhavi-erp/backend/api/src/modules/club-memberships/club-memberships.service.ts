import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateClubMembershipDto } from './dto/create-club-membership.dto';
import { ListClubMembershipsQueryDto } from './dto/list-club-memberships.query';
import { UpdateClubMembershipDto } from './dto/update-club-membership.dto';

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
export class ClubMembershipsService {
  private readonly logger = new Logger(ClubMembershipsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateClubMembershipDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.clubMembership.create({
          data: {
            instituteId: dto.instituteId,
            clubId: dto.clubId,
            studentId: dto.studentId,
            role: dto.role ?? undefined,
            isActive: dto.isActive ?? undefined,
          },
        });

        this.logger.log(`ClubMembership created: ${record.id}`);
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
    query: ListClubMembershipsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.clubMembership.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.ClubMembershipWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.clubId ? { clubId: query.clubId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),

    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.clubMembership.count({ where }),
      this.prisma.clubMembership.findMany({
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
    const record = await this.prisma.clubMembership.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`ClubMembership ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateClubMembershipDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.clubMembership.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`ClubMembership ${id} not found.`);
      }



      try {
        return await tx.clubMembership.update({
          where: { id },
          data: {
            clubId: dto.clubId ?? undefined,
            studentId: dto.studentId ?? undefined,
            role: dto.role !== undefined ? (dto.role ?? undefined) : undefined,
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
    return this.prisma.clubMembership.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.clubMembership.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`ClubMembership ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.clubMembership.update({
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
        'A ClubMembership with the same unique fields already exists.',
      );
    }
  }
}
