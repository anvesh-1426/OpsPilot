import { logger } from '../config/logger';

interface CacheItem {
  value: any;
  expiresAt: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheItem>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
  }

  async flush(): Promise<void> {
    this.memoryCache.clear();
    logger.info('🧹 [CacheService] Cache flushed successfully');
  }
}

export const cacheService = new CacheService();
