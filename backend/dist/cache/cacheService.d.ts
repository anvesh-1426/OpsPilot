declare class CacheService {
    private memoryCache;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    flush(): Promise<void>;
}
export declare const cacheService: CacheService;
export {};
//# sourceMappingURL=cacheService.d.ts.map