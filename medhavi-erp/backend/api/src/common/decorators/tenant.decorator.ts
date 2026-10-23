import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Tenant = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const tenantId = (request as any).tenantId || (request as any).instituteId;
    return tenantId;
  },
);
