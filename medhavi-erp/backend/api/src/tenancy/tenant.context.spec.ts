import { TenantStorage } from './tenant.context';

describe('TenantStorage', () => {
  it('should store and isolate tenant context across asynchronous boundaries', (done) => {
    const tenant1 = { instituteId: 'inst-1', campusId: 'camp-1', userId: 'user-1' };
    const tenant2 = { instituteId: 'inst-2', campusId: 'camp-2', userId: 'user-2' };

    let completed = 0;
    const checkDone = () => {
      completed++;
      if (completed === 2) done();
    };

    TenantStorage.run(tenant1, () => {
      setTimeout(() => {
        expect(TenantStorage.getInstituteId()).toBe('inst-1');
        expect(TenantStorage.getCampusId()).toBe('camp-1');
        checkDone();
      }, 20);
    });

    TenantStorage.run(tenant2, () => {
      setTimeout(() => {
        expect(TenantStorage.getInstituteId()).toBe('inst-2');
        expect(TenantStorage.getCampusId()).toBe('camp-2');
        checkDone();
      }, 10);
    });
  });

  it('should return undefined when outside a tenant context', () => {
    expect(TenantStorage.getInstituteId()).toBeUndefined();
    expect(TenantStorage.get()).toBeUndefined();
  });
});
