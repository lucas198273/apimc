// src/lib/cache.ts
import { CACHE } from '../config/constantes';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export class Cache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private pendingRequests = new Map<string, Promise<T>>();
  private ttl: number;

  constructor(ttl: number = CACHE.TTL) {
    this.ttl = ttl;
    this.startCleanupInterval();
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  async getOrSet(
    key: string, 
    factory: () => Promise<T>,
    options?: { skipCache?: boolean }
  ): Promise<T> {
    if (!options?.skipCache) {
      const cached = this.get(key);
      if (cached) return cached;
    }

    const pending = this.pendingRequests.get(key);
    if (pending) return pending;

    const promise = factory().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    const result = await promise;
    
    this.set(key, result);
    return result;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.ttl) {
          this.cache.delete(key);
        }
      }
    }, CACHE.CLEANUP_INTERVAL);
  }
}

// Cria e EXPORTA a instância do cache
export const paymentCache = new Cache<{ link: string; slug: string | null }>();