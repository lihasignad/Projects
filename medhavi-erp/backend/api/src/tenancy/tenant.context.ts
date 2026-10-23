import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  instituteId: string;
  campusId?: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<TenantContext>();

export class TenantStorage {
  static run<R>(context: TenantContext, callback: () => R): R {
    return storage.run(context, callback);
  }

  static get(): TenantContext | undefined {
    return storage.getStore();
  }

  static getInstituteId(): string | undefined {
    return storage.getStore()?.instituteId;
  }

  static getCampusId(): string | undefined {
    return storage.getStore()?.campusId;
  }
}
