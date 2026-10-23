import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantStorage } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerTenant =
      (req.headers['x-institute-id'] as string) ||
      (req.headers['x-tenant-id'] as string);
    const headerCampus = req.headers['x-campus-id'] as string;

    const user = (req as any).user;
    const instituteId = headerTenant || user?.instituteId || '';
    const campusId = headerCampus || user?.campusId || undefined;

    (req as any).tenantId = instituteId;
    (req as any).instituteId = instituteId;
    (req as any).campusId = campusId;

    if (instituteId) {
      TenantStorage.run(
        {
          instituteId,
          campusId,
          userId: user?.sub,
        },
        () => next(),
      );
    } else {
      next();
    }
  }
}
