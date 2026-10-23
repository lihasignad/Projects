import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePlacementApplicationDto } from './dto/create-placement-application.dto';
import { ListPlacementApplicationsQueryDto } from './dto/list-placement-applications.query';
import { UpdatePlacementApplicationDto } from './dto/update-placement-application.dto';

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
export class PlacementApplicationsService {
  private readonly logger = new Logger(PlacementApplicationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreatePlacementApplicationDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.placementApplication.create({
          data: {
            instituteId: dto.instituteId,
            driveId: dto.driveId,
            studentId: dto.studentId,
            stage: dto.stage ?? undefined,
            resumeFileObjectId: dto.resumeFileObjectId ?? undefined,
            coverLetter: dto.coverLetter ?? undefined,
            testScoresJson: dto.testScoresJson !== undefined ? (dto.testScoresJson as Prisma.InputJsonValue) : undefined,
            notes: dto.notes ?? undefined,
          },
        });

        this.logger.log(`PlacementApplication created: ${record.id}`);
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
    query: ListPlacementApplicationsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.placementApplication.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.PlacementApplicationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.driveId ? { driveId: query.driveId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.stage ? { stage: query.stage } : {}),

    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.placementApplication.count({ where }),
      this.prisma.placementApplication.findMany({
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
    const record = await this.prisma.placementApplication.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`PlacementApplication ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdatePlacementApplicationDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.placementApplication.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`PlacementApplication ${id} not found.`);
      }



      try {
        return await tx.placementApplication.update({
          where: { id },
          data: {
            driveId: dto.driveId ?? undefined,
            studentId: dto.studentId ?? undefined,
            stage: dto.stage !== undefined ? (dto.stage ?? undefined) : undefined,
            resumeFileObjectId: dto.resumeFileObjectId !== undefined ? (dto.resumeFileObjectId ?? undefined) : undefined,
            coverLetter: dto.coverLetter !== undefined ? (dto.coverLetter ?? undefined) : undefined,
            testScoresJson: dto.testScoresJson !== undefined ? (dto.testScoresJson as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.placementApplication.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.placementApplication.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`PlacementApplication ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.placementApplication.update({
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
        'A PlacementApplication with the same unique fields already exists.',
      );
    }
  }
}
