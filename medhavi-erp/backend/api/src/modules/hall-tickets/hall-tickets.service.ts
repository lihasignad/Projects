import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HallTicketStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateHallTicketDto } from './dto/create-hall-ticket.dto';
import { ListHallTicketsQueryDto } from './dto/list-hall-tickets.query';
import { UpdateHallTicketDto } from './dto/update-hall-ticket.dto';

export interface PaginatedResult<T> { data: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number }; }

@Injectable()
export class HallTicketsService {
  private readonly logger = new Logger(HallTicketsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHallTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institute.findFirst({ where: { id: dto.instituteId, deletedAt: null } });
      if (!inst) throw new NotFoundException(`Institute ${dto.instituteId} not found.`);
      const exam = await tx.exam.findFirst({ where: { id: dto.examId, deletedAt: null } });
      if (!exam) throw new NotFoundException(`Exam ${dto.examId} not found.`);
      if (exam.instituteId !== dto.instituteId) throw new BadRequestException('Exam does not belong to institute.');

      const student = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
      if (!student) throw new NotFoundException(`Student ${dto.studentId} not found.`);
      if (student.instituteId !== dto.instituteId) throw new BadRequestException('Student does not belong to institute.');

      try {
        const ht = await tx.hallTicket.create({
          data: {
            instituteId: dto.instituteId,
            examId: dto.examId,
            studentId: dto.studentId,
            ticketNumber: dto.ticketNumber,
            status: dto.status ?? HallTicketStatus.GENERATED,
            qrPayload: dto.qrPayload ?? null,
            issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
            fileObjectId: dto.fileObjectId ?? null,
            blockedReason: dto.blockedReason ?? null,
          },
        });
        this.logger.log(`HallTicket created: ${ht.id}`);
        return ht;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Hall ticket already exists for student in this exam or ticket number is duplicated.');
        }
        throw err;
      }
    });
  }

  async findAll(query: ListHallTicketsQueryDto): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
    const where: Prisma.HallTicketWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.instituteId ? { instituteId: query.instituteId } : {}),
      ...(query.examId ? { examId: query.examId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { ticketNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.hallTicket.count({ where }),
      this.prisma.hallTicket.findMany({ where, orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async findOne(id: string, opts: { includeDeleted?: boolean } = {}) {
    const ht = await this.prisma.hallTicket.findFirst({ where: { id, ...(opts.includeDeleted ? {} : { deletedAt: null }) } });
    if (!ht) throw new NotFoundException(`HallTicket ${id} not found.`);
    return ht;
  }

  async update(id: string, dto: UpdateHallTicketDto) {
    await this.findOne(id);
    return this.prisma.hallTicket.update({
      where: { id },
      data: {
        ticketNumber: dto.ticketNumber ?? undefined,
        status: dto.status ?? undefined,
        qrPayload: dto.qrPayload !== undefined ? (dto.qrPayload ?? null) : undefined,
        issuedAt: dto.issuedAt !== undefined ? (dto.issuedAt ? new Date(dto.issuedAt) : null) : undefined,
        fileObjectId: dto.fileObjectId !== undefined ? (dto.fileObjectId ?? null) : undefined,
        blockedReason: dto.blockedReason !== undefined ? (dto.blockedReason ?? null) : undefined,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    return this.prisma.hallTicket.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
  }

  async restore(id: string) {
    const existing = await this.prisma.hallTicket.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`HallTicket ${id} not found.`);
    if (!existing.deletedAt) return existing;
    return this.prisma.hallTicket.update({ where: { id }, data: { deletedAt: null } });
  }
}
