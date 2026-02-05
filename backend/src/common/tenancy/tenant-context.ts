import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextStore {
  companyId?: string | null;
  isKaeyrosUser?: boolean;
  userId?: string | null;
}

const tenantContext = new AsyncLocalStorage<TenantContextStore>();

export function runWithTenantContext<T>(
  store: TenantContextStore,
  callback: () => T
): T {
  return tenantContext.run(store, callback);
}

export function getTenantContext(): TenantContextStore | undefined {
  return tenantContext.getStore();
}
