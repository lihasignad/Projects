import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTransportVehicleDto } from './dto/create-transport-vehicle.dto';
import { ListTransportVehiclesQueryDto } from './dto/list-transport-vehicles.query';
import { UpdateTransportVehicleDto } from './dto/update-transport-vehicle.dto';

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
export class TransportVehiclesService {
  private readonly logger = new Logger(TransportVehiclesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateTransportVehicleDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertRegistrationNoUnique(tx, dto.instituteId, dto.registrationNo);

      try {
        const record = await tx.transportVehicle.create({
          data: {
            instituteId: dto.instituteId,
            routeId: dto.routeId ?? undefined,
            registrationNo: dto.registrationNo,
            model: dto.model ?? undefined,
            capacity: dto.capacity,
            driverName: dto.driverName ?? undefined,
            driverPhone: dto.driverPhone ?? undefined,
            driverLicense: dto.driverLicense ?? undefined,
            insuranceExpiresOn: dto.insuranceExpiresOn ?? undefined,
            pollutionExpiresOn: dto.pollutionExpiresOn ?? undefined,
            isActive: dto.isActive ?? undefined,
          },
        });

        this.logger.log(`TransportVehicle created: ${record.id}`);
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
    query: ListTransportVehiclesQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.transportVehicle.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'registrationNo';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.TransportVehicleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.routeId ? { routeId: query.routeId } : {}),
      ...(typeof query.isActive === 'boolean' ? { isActive: query.isActive } : {}),
      ...(query.search
        ? { registrationNo: { contains: query.search, mode: 'insensitive' } }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.transportVehicle.count({ where }),
      this.prisma.transportVehicle.findMany({
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
    const record = await this.prisma.transportVehicle.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!record) {
      throw new NotFoundException(`TransportVehicle ${id} not found.`);
    }
    return record;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateTransportVehicleDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportVehicle.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`TransportVehicle ${id} not found.`);
      }

      if (dto.registrationNo && dto.registrationNo !== existing.registrationNo) {
        await this.assertRegistrationNoUnique(tx, existing.instituteId, dto.registrationNo, id);
      }

      try {
        return await tx.transportVehicle.update({
          where: { id },
          data: {
            routeId: dto.routeId !== undefined ? (dto.routeId ?? undefined) : undefined,
            registrationNo: dto.registrationNo ?? undefined,
            model: dto.model !== undefined ? (dto.model ?? undefined) : undefined,
            capacity: dto.capacity ?? undefined,
            driverName: dto.driverName !== undefined ? (dto.driverName ?? undefined) : undefined,
            driverPhone: dto.driverPhone !== undefined ? (dto.driverPhone ?? undefined) : undefined,
            driverLicense: dto.driverLicense !== undefined ? (dto.driverLicense ?? undefined) : undefined,
            insuranceExpiresOn: dto.insuranceExpiresOn !== undefined ? (dto.insuranceExpiresOn ?? undefined) : undefined,
            pollutionExpiresOn: dto.pollutionExpiresOn !== undefined ? (dto.pollutionExpiresOn ?? undefined) : undefined,
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
    return this.prisma.transportVehicle.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.transportVehicle.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`TransportVehicle ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      await this.assertRegistrationNoUnique(tx, existing.instituteId, existing.registrationNo, existing.id);

      return tx.transportVehicle.update({
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

  private async assertRegistrationNoUnique(
    tx: Prisma.TransactionClient,
    instituteId: string,
    registrationNo: string,
    excludeId?: string,
  ) {
    const clash = await tx.transportVehicle.findFirst({
      where: {
        instituteId,
        registrationNo,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (clash) {
      throw new ConflictException(
        `A TransportVehicle with registrationNo "${registrationNo}" already exists.`,
      );
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new ConflictException(
        'A TransportVehicle with the same unique fields already exists.',
      );
    }
  }
}
