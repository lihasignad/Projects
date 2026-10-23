import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreatePlacementOfferDto } from './dto/create-placement-offer.dto';
import { ListPlacementOffersQueryDto } from './dto/list-placement-offers.query';
import { UpdatePlacementOfferDto } from './dto/update-placement-offer.dto';

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
export class PlacementOffersService {
  private readonly logger = new Logger(PlacementOffersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreatePlacementOfferDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.placementOffer.create({
          data: {
            instituteId: dto.instituteId,
            driveId: dto.driveId,
            applicationId: dto.applicationId,
            companyId: dto.companyId,
            studentId: dto.studentId,
            type: dto.type,
            status: dto.status ?? undefined,
            jobRole: dto.jobRole,
            ctc: new Prisma.Decimal(dto.ctc),
            baseSalary: dto.baseSalary !== undefined ? new Prisma.Decimal(dto.baseSalary) : undefined,
            stipend: dto.stipend !== undefined ? new Prisma.Decimal(dto.stipend) : undefined,
            currency: dto.currency ?? undefined,
            location: dto.location ?? undefined,
            joiningDate: dto.joiningDate ?? undefined,
            offerLetterFileObjectId: dto.offerLetterFileObjectId ?? undefined,
            responseDeadline: dto.responseDeadline ?? undefined,
            isPrimaryOffer: dto.isPrimaryOffer ?? undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`PlacementOffer created: ${record.id}`);
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
    query: ListPlacementOffersQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.placementOffer.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.PlacementOfferWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.driveId ? { driveId: query.driveId } : {}),
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { jobRole: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.placementOffer.count({ where }),
      this.prisma.placementOffer.findMany({
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
    const record = await this.prisma.placementOffer.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`PlacementOffer ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdatePlacementOfferDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.placementOffer.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`PlacementOffer ${id} not found.`);
      }



      try {
        return await tx.placementOffer.update({
          where: { id },
          data: {
            driveId: dto.driveId ?? undefined,
            applicationId: dto.applicationId ?? undefined,
            companyId: dto.companyId ?? undefined,
            studentId: dto.studentId ?? undefined,
            type: dto.type ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            jobRole: dto.jobRole ?? undefined,
            ctc: dto.ctc !== undefined ? new Prisma.Decimal(dto.ctc) : undefined,
            baseSalary: dto.baseSalary !== undefined ? new Prisma.Decimal(dto.baseSalary) : undefined,
            stipend: dto.stipend !== undefined ? new Prisma.Decimal(dto.stipend) : undefined,
            currency: dto.currency !== undefined ? (dto.currency ?? undefined) : undefined,
            location: dto.location !== undefined ? (dto.location ?? undefined) : undefined,
            joiningDate: dto.joiningDate !== undefined ? (dto.joiningDate ?? undefined) : undefined,
            offerLetterFileObjectId: dto.offerLetterFileObjectId !== undefined ? (dto.offerLetterFileObjectId ?? undefined) : undefined,
            responseDeadline: dto.responseDeadline !== undefined ? (dto.responseDeadline ?? undefined) : undefined,
            isPrimaryOffer: dto.isPrimaryOffer !== undefined ? (dto.isPrimaryOffer ?? undefined) : undefined,
            metadata: dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.placementOffer.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.placementOffer.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`PlacementOffer ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.placementOffer.update({
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
        'A PlacementOffer with the same unique fields already exists.',
      );
    }
  }
}
