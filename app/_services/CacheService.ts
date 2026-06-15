interface CacheRef {
  path?: string;
  [key: string]: unknown;
}

const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h
const CACHE_TIMESTAMP_SUFFIX = '_timestamp';

const CacheHelper = {
  generateKey(prefix: string, identifier: string): string {
    return `${prefix}${identifier}`;
  },

  generateRefsKey(prefix: string, refs: (CacheRef | string)[]): string {
    const sortedPaths = refs.map(ref => 
      typeof ref === 'string' ? ref : (ref.path || ref.toString())
    ).sort().join('|');
    return `${prefix}${btoa(sortedPaths)}`;
  },

  isCacheValid(cacheKey: string, duration: number = DEFAULT_CACHE_DURATION): boolean {
    try {
      const timestampKey = `${cacheKey}${CACHE_TIMESTAMP_SUFFIX}`;
      const timestamp = localStorage.getItem(timestampKey);
      
      if (!timestamp) return false;
      
      const cacheTime = parseInt(timestamp);
      const now = Date.now();
      
      return (now - cacheTime) < duration;
    } catch {
      return false;
    }
  },

  getFromCache<T = unknown>(cacheKey: string, duration: number = DEFAULT_CACHE_DURATION): T | null {
    if (!this.isCacheValid(cacheKey, duration)) {
      this.removeFromCache(cacheKey);
      return null;
    }

    try {
      const data = localStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch {
      this.removeFromCache(cacheKey);
      return null;
    }
  },

  saveToCache<T = unknown>(cacheKey: string, data: T): void {
    try {
      const timestampKey = `${cacheKey}${CACHE_TIMESTAMP_SUFFIX}`;
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(timestampKey, Date.now().toString());
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanExpiredCache();
        try {
          const timestampKey = `${cacheKey}${CACHE_TIMESTAMP_SUFFIX}`;
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(timestampKey, Date.now().toString());
        } catch (retryError) {
          console.error('Cache storage failed:', retryError);
        }
      }
    }
  },

  removeFromCache(cacheKey: string): void {
    try {
      const timestampKey = `${cacheKey}${CACHE_TIMESTAMP_SUFFIX}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
    } catch {
      // Silent fail
    }
  },

  clearCacheByPrefix(prefix: string): number {
    try {
      const keys = Object.keys(localStorage);
      const matchingKeys = keys.filter(key => key.startsWith(prefix));
      
      matchingKeys.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}${CACHE_TIMESTAMP_SUFFIX}`);
      });
      
      return matchingKeys.filter(key => !key.endsWith(CACHE_TIMESTAMP_SUFFIX)).length;
    } catch {
      return 0;
    }
  },

  cleanExpiredCache(): number {
    try {
      const keys = Object.keys(localStorage);
      const timestampKeys = keys.filter(key => key.endsWith(CACHE_TIMESTAMP_SUFFIX));
      let removedCount = 0;

      timestampKeys.forEach(timestampKey => {
        const cacheKey = timestampKey.replace(CACHE_TIMESTAMP_SUFFIX, '');
        if (!this.isCacheValid(cacheKey)) {
          this.removeFromCache(cacheKey);
          removedCount++;
        }
      });

      return removedCount;
    } catch {
      return 0;
    }
  },
};

export default CacheHelper;
