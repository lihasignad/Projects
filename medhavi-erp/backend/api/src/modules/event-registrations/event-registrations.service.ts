import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { ListEventRegistrationsQueryDto } from './dto/list-event-registrations.query';
import { UpdateEventRegistrationDto } from './dto/update-event-registration.dto';

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
export class EventRegistrationsService {
  private readonly logger = new Logger(EventRegistrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateEventRegistrationDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);

      try {
        const record = await tx.eventRegistration.create({
          data: {
            instituteId: dto.instituteId,
            eventId: dto.eventId,
            studentId: dto.studentId ?? undefined,
            userId: dto.userId,
            feePaid: dto.feePaid ?? undefined,
          },
        });

        this.logger.log(`EventRegistration created: ${record.id}`);
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
    query: ListEventRegistrationsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.eventRegistration.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.EventRegistrationWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.eventId ? { eventId: query.eventId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),

    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.eventRegistration.count({ where }),
      this.prisma.eventRegistration.findMany({
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
    const record = await this.prisma.eventRegistration.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`EventRegistration ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateEventRegistrationDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.eventRegistration.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`EventRegistration ${id} not found.`);
      }



      try {
        return await tx.eventRegistration.update({
          where: { id },
          data: {
            eventId: dto.eventId ?? undefined,
            studentId: dto.studentId !== undefined ? (dto.studentId ?? undefined) : undefined,
            userId: dto.userId ?? undefined,
            feePaid: dto.feePaid !== undefined ? (dto.feePaid ?? undefined) : undefined,
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
    return this.prisma.eventRegistration.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.eventRegistration.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`EventRegistration ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;



      return tx.eventRegistration.update({
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
        'A EventRegistration with the same unique fields already exists.',
      );
    }
  }
}
