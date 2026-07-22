"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueService = void 0;
const logger_1 = require("../config/logger");
class QueueService {
    constructor() {
        this.queue = [];
    }
    async addJob(type, data) {
        const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const job = { id, type, data, createdAt: new Date() };
        this.queue.push(job);
        logger_1.logger.info(`📥 [QueueService] Enqueued job ${id} (Type: ${type})`);
        // Process job asynchronously
        setTimeout(() => this.processNextJob(), 500);
        return id;
    }
    async processNextJob() {
        if (this.queue.length === 0)
            return;
        const job = this.queue.shift();
        if (!job)
            return;
        logger_1.logger.info(`⚙️ [QueueService] Processing job ${job.id} (Type: ${job.type})...`);
        try {
            // Execute background task
            logger_1.logger.info(`✅ [QueueService] Job ${job.id} completed successfully.`);
        }
        catch (err) {
            logger_1.logger.error(`❌ [QueueService] Job ${job.id} failed:`, err);
        }
    }
}
exports.queueService = new QueueService();
//# sourceMappingURL=queueService.js.map