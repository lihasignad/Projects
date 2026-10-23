import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePlacementDriveDto } from './dto/create-placement-drive.dto';
import { ListPlacementDrivesQueryDto } from './dto/list-placement-drives.query';
import { UpdatePlacementDriveDto } from './dto/update-placement-drive.dto';

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
export class PlacementDrivesService {
  private readonly logger = new Logger(PlacementDrivesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreatePlacementDriveDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.placementDrive.create({
          data: {
            instituteId: dto.instituteId,
            companyId: dto.companyId,
            academicYearId: dto.academicYearId,
            title: dto.title,
            description: dto.description ?? undefined,
            type: dto.type,
            status: dto.status ?? undefined,
            jobRole: dto.jobRole,
            jobDescription: dto.jobDescription ?? undefined,
            ctcMin: dto.ctcMin !== undefined ? new Prisma.Decimal(dto.ctcMin) : undefined,
            ctcMax: dto.ctcMax !== undefined ? new Prisma.Decimal(dto.ctcMax) : undefined,
            stipend: dto.stipend !== undefined ? new Prisma.Decimal(dto.stipend) : undefined,
            currency: dto.currency ?? undefined,
            locations: dto.locations ?? undefined,
            bondYears: dto.bondYears ?? undefined,
            eligibilityJson: dto.eligibilityJson !== undefined ? (dto.eligibilityJson as Prisma.InputJsonValue) : undefined,
            minCgpa: dto.minCgpa !== undefined ? new Prisma.Decimal(dto.minCgpa) : undefined,
            maxBacklogs: dto.maxBacklogs ?? undefined,
            eligibleProgramsJson: dto.eligibleProgramsJson !== undefined ? (dto.eligibleProgramsJson as Prisma.InputJsonValue) : undefined,
            registrationOpensAt: dto.registrationOpensAt ?? undefined,
            registrationClosesAt: dto.registrationClosesAt ?? undefined,
            driveDate: dto.driveDate ?? undefined,
            totalSeats: dto.totalSeats ?? undefined,
            coordinatorUserId: dto.coordinatorUserId ?? undefined,
          },
        });

        this.logger.log(`PlacementDrive created: ${record.id}`);
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
    query: ListPlacementDrivesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.placementDrive.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.PlacementDriveWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.academicYearId ? { academicYearId: query.academicYearId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { jobRole: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.placementDrive.count({ where }),
      this.prisma.placementDrive.findMany({
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
    const record = await this.prisma.placementDrive.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`PlacementDrive ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdatePlacementDriveDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.placementDrive.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`PlacementDrive ${id} not found.`);
      }



      try {
        return await tx.placementDrive.update({
          where: { id },
          data: {
            companyId: dto.companyId ?? undefined,
            academicYearId: dto.academicYearId ?? undefined,
            title: dto.title ?? undefined,
            description: dto.description !== undefined ? (dto.description ?? undefined) : undefined,
            type: dto.type ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            jobRole: dto.jobRole ?? undefined,
            jobDescription: dto.jobDescription !== undefined ? (dto.jobDescription ?? undefined) : undefined,
            ctcMin: dto.ctcMin !== undefined ? new Prisma.Decimal(dto.ctcMin) : undefined,
            ctcMax: dto.ctcMax !== undefined ? new Prisma.Decimal(dto.ctcMax) : undefined,
            stipend: dto.stipend !== undefined ? new Prisma.Decimal(dto.stipend) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            locations: dto.locations !== undefined ? (dto.locations ?? undefined) : undefined,
            bondYears: dto.bondYears !== undefined ? (dto.bondYears ?? undefined) : undefined,
            eligibilityJson: dto.eligibilityJson !== undefined ? (dto.eligibilityJson as Prisma.InputJsonValue) : undefined,
            minCgpa: dto.minCgpa !== undefined ? new Prisma.Decimal(dto.minCgpa) : undefined,
            maxBacklogs: dto.maxBacklogs !== undefined ? (dto.maxBacklogs ?? undefined) : undefined,
            eligibleProgramsJson: dto.eligibleProgramsJson !== undefined ? (dto.eligibleProgramsJson as Prisma.InputJsonValue) : undefined,
            registrationOpensAt: dto.registrationOpensAt !== undefined ? (dto.registrationOpensAt ?? undefined) : undefined,
            registrationClosesAt: dto.registrationClosesAt !== undefined ? (dto.registrationClosesAt ?? undefined) : undefined,
            driveDate: dto.driveDate !== undefined ? (dto.driveDate ?? undefined) : undefined,
            totalSeats: dto.totalSeats !== undefined ? (dto.totalSeats ?? undefined) : undefined,
            coordinatorUserId: dto.coordinatorUserId !== undefined ? (dto.coordinatorUserId ?? undefined) : undefined,
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
    return this.prisma.placementDrive.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.placementDrive.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`PlacementDrive ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.placementDrive.update({
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
        'A PlacementDrive with the same unique fields already exists.',
      );
    }
  }
}
