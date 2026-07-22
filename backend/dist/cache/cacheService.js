"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const logger_1 = require("../config/logger");
class CacheService {
    constructor() {
        this.memoryCache = new Map();
    }
    async get(key) {
        const item = this.memoryCache.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.value;
    }
    async set(key, value, ttlSeconds = 300) {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.memoryCache.set(key, { value, expiresAt });
    }
    async del(key) {
        this.memoryCache.delete(key);
    }
    async flush() {
        this.memoryCache.clear();
        logger_1.logger.info('🧹 [CacheService] Cache flushed successfully');
    }
}
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map