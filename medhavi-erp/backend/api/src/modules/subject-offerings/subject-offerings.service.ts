import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateSubjectOfferingDto } from './dto/create-subject-offering.dto';
import { ListSubjectOfferingsQueryDto } from './dto/list-subject-offerings.query';
import { UpdateSubjectOfferingDto } from './dto/update-subject-offering.dto';

// Re-exported for future audit-log re-integration (mirrors sections.service).
export { AuditAction };

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * SubjectOfferingsService
 *
 * CRUD + soft delete for the SubjectOffering aggregate. Audit logging is
 * intentionally omitted in this revision (parity with sections.service);
 * AuditAction is re-exported so a follow-up can re-wire AuditService without
 * touching controllers.
 *
 * Invariants enforced:
 *  - `instituteId` references a non-deleted Institute.
 *  - `subjectId` references a non-deleted Subject belonging to the same institute.
 *  - `termId` references a non-deleted Term belonging to the same institute.
 *  - `departmentId` references a non-deleted Department belonging to the same institute.
 *  - `programId` (when provided) references a non-deleted Program belonging to the same institute.
 *  - `sectionId` (when provided) references a non-deleted Section belonging to the same institute.
 *  - `syllabusFileId` (when provided) references an existing FileObject.
 *  - `offeringCode` is unique within `termId` among non-deleted offerings.
 *  - `(subjectId, termId, sectionId)` is unique among non-deleted offerings.
 */
@Injectable()
export class SubjectOfferingsService {
  private readonly logger = new Logger(SubjectOfferingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------------------------------
  // CREATE
  // --------------------------------------------------------------------------
  async create(dto: CreateSubjectOfferingDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.assertInstituteExists(tx, dto.instituteId);
      await this.assertSubjectBelongsToInstitute(
        tx,
        dto.subjectId,
        dto.instituteId,
      );
      await this.assertTermBelongsToInstitute(tx, dto.termId, dto.instituteId);
      await this.assertDepartmentBelongsToInstitute(
        tx,
        dto.departmentId,
        dto.instituteId,
      );
      if (dto.programId) {
        await this.assertProgramBelongsToInstitute(
          tx,
          dto.programId,
          dto.instituteId,
        );
      }
      if (dto.sectionId) {
        await this.assertSectionBelongsToInstitute(
          tx,
          dto.sectionId,
          dto.instituteId,
        );
      }
      if (dto.syllabusFileId) {
        await this.assertFileObjectExists(tx, dto.syllabusFileId);
      }

      this.assertRegistrationWindow(dto.registrationStart, dto.registrationEnd);
      this.assertCapacityVsCounts(
        dto.capacity,
        dto.enrolledCount,
        dto.waitlistCount,
      );

      await this.assertOfferingCodeUnique(tx, dto.termId, dto.offeringCode);
      await this.assertCompositeUnique(
        tx,
        dto.subjectId,
        dto.termId,
        dto.sectionId ?? null,
      );

      try {
        const offering = await tx.subjectOffering.create({
          data: {
            instituteId: dto.instituteId,
            subjectId: dto.subjectId,
            termId: dto.termId,
            sectionId: dto.sectionId ?? null,
            programId: dto.programId ?? null,
            departmentId: dto.departmentId,
            offeringCode: dto.offeringCode,
            capacity: dto.capacity,
            enrolledCount: dto.enrolledCount ?? undefined,
            waitlistCount: dto.waitlistCount ?? undefined,
            creditsOverride:
              dto.creditsOverride === undefined
                ? undefined
                : new Prisma.Decimal(dto.creditsOverride),
            gradingScheme: dto.gradingScheme ?? undefined,
            registrationStart: dto.registrationStart
              ? new Date(dto.registrationStart)
              : undefined,
            registrationEnd: dto.registrationEnd
              ? new Date(dto.registrationEnd)
              : undefined,
            status: dto.status ?? undefined,
            syllabusFileId: dto.syllabusFileId ?? null,
            metadata:
              dto.metadata === undefined
                ? undefined
                : (dto.metadata as Prisma.InputJsonValue),
          },
        });

        this.logger.log(
          `SubjectOffering created: ${offering.id} (${offering.offeringCode})`,
        );
        return offering;
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
    query: ListSubjectOfferingsQueryDto,
  ): Promise<
    PaginatedResult<
      Awaited<ReturnType<typeof this.prisma.subjectOffering.findFirst>>
    >
  > {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'offeringCode';
    const sortOrder = query.sortOrder ?? 'asc';

    const where: Prisma.SubjectOfferingWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.sectionId ? { sectionId: query.sectionId } : {}),
      ...(query.programId ? { programId: query.programId } : {}),
      ...(query.departmentId ? { departmentId: query.departmentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              {
                offeringCode: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.subjectOffering.count({ where }),
      this.prisma.subjectOffering.findMany({
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
    const offering = await this.prisma.subjectOffering.findFirst({
      where: {
        id,
        ...(opts.includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!offering) {
      throw new NotFoundException(`SubjectOffering ${id} not found.`);
    }
    return offering;
  }

  // --------------------------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------------------------
  async update(id: string, dto: UpdateSubjectOfferingDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.subjectOffering.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException(`SubjectOffering ${id} not found.`);
      }

      if (dto.subjectId && dto.subjectId !== existing.subjectId) {
        await this.assertSubjectBelongsToInstitute(
          tx,
          dto.subjectId,
          existing.instituteId,
        );
      }
      if (dto.termId && dto.termId !== existing.termId) {
        await this.assertTermBelongsToInstitute(
          tx,
          dto.termId,
          existing.instituteId,
        );
      }
      if (dto.departmentId && dto.departmentId !== existing.departmentId) {
        await this.assertDepartmentBelongsToInstitute(
          tx,
          dto.departmentId,
          existing.instituteId,
        );
      }
      if (dto.programId && dto.programId !== existing.programId) {
        await this.assertProgramBelongsToInstitute(
          tx,
          dto.programId,
          existing.instituteId,
        );
      }
      if (dto.sectionId && dto.sectionId !== existing.sectionId) {
        await this.assertSectionBelongsToInstitute(
          tx,
          dto.sectionId,
          existing.instituteId,
        );
      }
      if (
        dto.syllabusFileId &&
        dto.syllabusFileId !== existing.syllabusFileId
      ) {
        await this.assertFileObjectExists(tx, dto.syllabusFileId);
      }

      const targetTermId = dto.termId ?? existing.termId;
      const targetSubjectId = dto.subjectId ?? existing.subjectId;
      const targetSectionId =
        dto.sectionId === undefined
          ? existing.sectionId
          : (dto.sectionId ?? null);
      const targetOfferingCode = dto.offeringCode ?? existing.offeringCode;

      if (
        (dto.offeringCode && dto.offeringCode !== existing.offeringCode) ||
        (dto.termId && dto.termId !== existing.termId)
      ) {
        await this.assertOfferingCodeUnique(
          tx,
          targetTermId,
          targetOfferingCode,
          id,
        );
      }

      if (
        (dto.subjectId && dto.subjectId !== existing.subjectId) ||
        (dto.termId && dto.termId !== existing.termId) ||
        (dto.sectionId !== undefined && dto.sectionId !== existing.sectionId)
      ) {
        await this.assertCompositeUnique(
          tx,
          targetSubjectId,
          targetTermId,
          targetSectionId,
          id,
        );
      }

      const nextStart =
        dto.registrationStart !== undefined
          ? dto.registrationStart
            ? new Date(dto.registrationStart)
            : null
          : existing.registrationStart;
      const nextEnd =
        dto.registrationEnd !== undefined
          ? dto.registrationEnd
            ? new Date(dto.registrationEnd)
            : null
          : existing.registrationEnd;
      this.assertRegistrationWindow(
        nextStart ?? undefined,
        nextEnd ?? undefined,
      );

      const nextCapacity = dto.capacity ?? existing.capacity;
      const nextEnrolled = dto.enrolledCount ?? existing.enrolledCount;
      const nextWaitlist = dto.waitlistCount ?? existing.waitlistCount;
      this.assertCapacityVsCounts(nextCapacity, nextEnrolled, nextWaitlist);

      try {
        return await tx.subjectOffering.update({
          where: { id },
          data: {
            subjectId: dto.subjectId ?? undefined,
            termId: dto.termId ?? undefined,
            sectionId:
              dto.sectionId === undefined
                ? undefined
                : (dto.sectionId ?? null),
            programId:
              dto.programId === undefined
                ? undefined
                : (dto.programId ?? null),
            departmentId: dto.departmentId ?? undefined,
            offeringCode: dto.offeringCode ?? undefined,
            capacity: dto.capacity ?? undefined,
            enrolledCount: dto.enrolledCount ?? undefined,
            waitlistCount: dto.waitlistCount ?? undefined,
            creditsOverride:
              dto.creditsOverride === undefined
                ? undefined
                : new Prisma.Decimal(dto.creditsOverride),
            gradingScheme: dto.gradingScheme ?? undefined,
            registrationStart:
              dto.registrationStart === undefined
                ? undefined
                : dto.registrationStart
                  ? new Date(dto.registrationStart)
                  : null,
            registrationEnd:
              dto.registrationEnd === undefined
                ? undefined
                : dto.registrationEnd
                  ? new Date(dto.registrationEnd)
                  : null,
            status: dto.status ?? undefined,
            syllabusFileId:
              dto.syllabusFileId === undefined
                ? undefined
                : (dto.syllabusFileId ?? null),
            metadata:
              dto.metadata === undefined
                ? undefined
                : (dto.metadata as Prisma.InputJsonValue),
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
    return this.prisma.subjectOffering.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }

  // --------------------------------------------------------------------------
  // RESTORE
  // --------------------------------------------------------------------------
  async restore(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.subjectOffering.findFirst({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`SubjectOffering ${id} not found.`);
      }
      if (!existing.deletedAt) return existing;

      // Re-validate hierarchy and uniqueness on restore.
      await this.assertSubjectBelongsToInstitute(
        tx,
        existing.subjectId,
        existing.instituteId,
      );
      await this.assertTermBelongsToInstitute(
        tx,
        existing.termId,
        existing.instituteId,
      );
      await this.assertDepartmentBelongsToInstitute(
        tx,
        existing.departmentId,
        existing.instituteId,
      );
      if (existing.programId) {
        await this.assertProgramBelongsToInstitute(
          tx,
          existing.programId,
          existing.instituteId,
        );
      }
      if (existing.sectionId) {
        await this.assertSectionBelongsToInstitute(
          tx,
          existing.sectionId,
          existing.instituteId,
        );
      }
      await this.assertOfferingCodeUnique(
        tx,
        existing.termId,
        existing.offeringCode,
        existing.id,
      );
      await this.assertCompositeUnique(
        tx,
        existing.subjectId,
        existing.termId,
        existing.sectionId,
        existing.id,
      );

      return tx.subjectOffering.update({
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
    const institute = await tx.institute.findFirst({
      where: { id: instituteId, deletedAt: null },
      select: { id: true },
    });
    if (!institute) {
      throw new NotFoundException(`Institute ${instituteId} not found.`);
    }
  }

  private async assertSubjectBelongsToInstitute(
    tx: Prisma.TransactionClient,
    subjectId: string,
    instituteId: string,
  ) {
    const subject = await tx.subject.findFirst({
      where: { id: subjectId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!subject) {
      throw new NotFoundException(`Subject ${subjectId} not found.`);
    }
    if (subject.instituteId !== instituteId) {
      throw new BadRequestException(
        `Subject ${subjectId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertTermBelongsToInstitute(
    tx: Prisma.TransactionClient,
    termId: string,
    instituteId: string,
  ) {
    const term = await tx.term.findFirst({
      where: { id: termId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!term) {
      throw new NotFoundException(`Term ${termId} not found.`);
    }
    if (term.instituteId !== instituteId) {
      throw new BadRequestException(
        `Term ${termId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertDepartmentBelongsToInstitute(
    tx: Prisma.TransactionClient,
    departmentId: string,
    instituteId: string,
  ) {
    const department = await tx.department.findFirst({
      where: { id: departmentId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!department) {
      throw new NotFoundException(`Department ${departmentId} not found.`);
    }
    if (department.instituteId !== instituteId) {
      throw new BadRequestException(
        `Department ${departmentId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertProgramBelongsToInstitute(
    tx: Prisma.TransactionClient,
    programId: string,
    instituteId: string,
  ) {
    const program = await tx.program.findFirst({
      where: { id: programId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!program) {
      throw new NotFoundException(`Program ${programId} not found.`);
    }
    if (program.instituteId !== instituteId) {
      throw new BadRequestException(
        `Program ${programId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertSectionBelongsToInstitute(
    tx: Prisma.TransactionClient,
    sectionId: string,
    instituteId: string,
  ) {
    const section = await tx.section.findFirst({
      where: { id: sectionId, deletedAt: null },
      select: { id: true, instituteId: true },
    });
    if (!section) {
      throw new NotFoundException(`Section ${sectionId} not found.`);
    }
    if (section.instituteId !== instituteId) {
      throw new BadRequestException(
        `Section ${sectionId} does not belong to institute ${instituteId}.`,
      );
    }
  }

  private async assertFileObjectExists(
    tx: Prisma.TransactionClient,
    fileId: string,
  ) {
    const file = await tx.fileObject.findFirst({
      where: { id: fileId },
      select: { id: true },
    });
    if (!file) {
      throw new NotFoundException(`FileObject ${fileId} not found.`);
    }
  }

  private async assertOfferingCodeUnique(
    tx: Prisma.TransactionClient,
    termId: string,
    offeringCode: string,
    excludeId?: string,
  ) {
    const existing = await tx.subjectOffering.findFirst({
      where: {
        termId,
        offeringCode,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `SubjectOffering with offeringCode "${offeringCode}" already exists in this term.`,
      );
    }
  }

  private async assertCompositeUnique(
    tx: Prisma.TransactionClient,
    subjectId: string,
    termId: string,
    sectionId: string | null,
    excludeId?: string,
  ) {
    const existing = await tx.subjectOffering.findFirst({
      where: {
        subjectId,
        termId,
        sectionId,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `A SubjectOffering already exists for the same subject, term, and section.`,
      );
    }
  }

  private assertRegistrationWindow(start?: Date | string, end?: Date | string) {
    if (!start || !end) return;
    const s = start instanceof Date ? start : new Date(start);
    const e = end instanceof Date ? end : new Date(end);
    if (s.getTime() > e.getTime()) {
      throw new BadRequestException(
        'registrationStart must be on or before registrationEnd.',
      );
    }
  }

  private assertCapacityVsCounts(
    capacity: number,
    enrolledCount?: number,
    waitlistCount?: number,
  ) {
    if (enrolledCount !== undefined && enrolledCount > capacity) {
      throw new BadRequestException(
        'enrolledCount cannot exceed capacity.',
      );
    }
    if (waitlistCount !== undefined && waitlistCount < 0) {
      throw new BadRequestException('waitlistCount cannot be negative.');
    }
  }

  private translateUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta!.target as string[]).join(',')
        : String(err.meta?.target ?? '');
      if (target.includes('offering_code')) {
        throw new ConflictException(
          'A SubjectOffering with the same offeringCode already exists in this term.',
        );
      }
      throw new ConflictException(
        'A SubjectOffering already exists for the same subject, term, and section.',
      );
    }
  }
}
