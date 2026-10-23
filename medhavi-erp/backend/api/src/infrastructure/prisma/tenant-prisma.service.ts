import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantStorage } from '../../tenancy/tenant.context';

@Injectable()
export class TenantPrismaService {
  constructor(public readonly prisma: PrismaService) {}

  get currentInstituteId(): string | undefined {
    return TenantStorage.getInstituteId();
  }

  get currentCampusId(): string | undefined {
    return TenantStorage.getCampusId();
  }

  /**
   * Automatically attaches instituteId to the where condition if available in context
   */
  withTenantWhere<T extends Record<string, any>>(where: T): T {
    const instituteId = this.currentInstituteId;
    if (instituteId && !where.instituteId) {
      return { ...where, instituteId };
    }
    return where;
  }

  /**
   * Automatically attaches instituteId to data creation payload if available in context
   */
  withTenantData<T extends Record<string, any>>(data: T): T {
    const instituteId = this.currentInstituteId;
    if (instituteId && !data.instituteId) {
      return { ...data, instituteId };
    }
    return data;
  }
}
