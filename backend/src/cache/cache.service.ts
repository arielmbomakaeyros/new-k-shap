import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Note: The generic cache manager doesn't have a reset method
    // We'll implement a workaround by clearing all known keys or using a specific store
    // For now, we'll skip this implementation or throw an error
    console.warn('Cache reset not implemented for generic cache manager');
  }

  // Helper methods for common cache patterns
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  // Invalidate cache by pattern (e.g., "user:*", "company:123:*")
  async invalidatePattern(pattern: string): Promise<void> {
    // Note: This requires Redis SCAN command
    // Implementation depends on your cache-manager-redis-yet version
    // You may need to access the Redis client directly
    console.warn('invalidatePattern not implemented for generic cache manager');
  }

  // Company-scoped cache helpers
  getCompanyKey(companyId: string, key: string): string {
    return `company:${companyId}:${key}`;
  }

  async getCompanyData<T>(companyId: string, key: string): Promise<T | undefined> {
    return this.get<T>(this.getCompanyKey(companyId, key));
  }

  async setCompanyData(companyId: string, key: string, value: any, ttl?: number): Promise<void> {
    await this.set(this.getCompanyKey(companyId, key), value, ttl);
  }
}
