import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { ListCertificatesQueryDto } from './dto/list-certificates.query';
import { UpdateCertificateDto } from './dto/update-certificate.dto';

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
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateCertificateDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.certificate.create({
          data: {
            instituteId: dto.instituteId,
            studentId: dto.studentId,
            type: dto.type,
            status: dto.status ?? undefined,
            certificateNumber: dto.certificateNumber ?? undefined,
            verificationCode: dto.verificationCode ?? undefined,
            purpose: dto.purpose ?? undefined,
            fileObjectId: dto.fileObjectId ?? undefined,
            rejectedReason: dto.rejectedReason ?? undefined,
            payloadJson: dto.payloadJson !== undefined ? (dto.payloadJson as Prisma.InputJsonValue) : undefined,
          },
        });

        this.logger.log(`Certificate created: ${record.id}`);
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
    query: ListCertificatesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.certificate.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.CertificateWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? { certificateNumber: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.certificate.count({ where }),
      this.prisma.certificate.findMany({
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
    const record = await this.prisma.certificate.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`Certificate ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateCertificateDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.certificate.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`Certificate ${id} not found.`);
      }



      try {
        return await tx.certificate.update({
          where: { id },
          data: {
            studentId: dto.studentId ?? undefined,
            type: dto.type ?? undefined,
            status: dto.status !== undefined ? (dto.status ?? undefined) : undefined,
            certificateNumber: dto.certificateNumber !== undefined ? (dto.certificateNumber ?? undefined) : undefined,
            verificationCode: dto.verificationCode !== undefined ? (dto.verificationCode ?? undefined) : undefined,
            purpose: dto.purpose !== undefined ? (dto.purpose ?? undefined) : undefined,
            fileObjectId: dto.fileObjectId !== undefined ? (dto.fileObjectId ?? undefined) : undefined,
            rejectedReason: dto.rejectedReason !== undefined ? (dto.rejectedReason ?? undefined) : undefined,
            payloadJson: dto.payloadJson !== undefined ? (dto.payloadJson as Prisma.InputJsonValue) : undefined,
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
    return this.prisma.certificate.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.certificate.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Certificate ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.certificate.update({
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
        'A Certificate with the same unique fields already exists.',
      );
    }
  }
}
