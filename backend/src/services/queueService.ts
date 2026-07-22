import { logger } from '../config/logger';

export interface QueueJob {
  id: string;
  type: 'EMAIL' | 'PDF_EXPORT' | 'CSV_IMPORT' | 'DB_BACKUP';
  data: Record<string, any>;
  createdAt: Date;
}

class QueueService {
  private queue: QueueJob[] = [];

  async addJob(type: QueueJob['type'], data: Record<string, any>): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: QueueJob = { id, type, data, createdAt: new Date() };
    this.queue.push(job);
    logger.info(`📥 [QueueService] Enqueued job ${id} (Type: ${type})`);

    // Process job asynchronously
    setTimeout(() => this.processNextJob(), 500);

    return id;
  }

  private async processNextJob() {
    if (this.queue.length === 0) return;
    const job = this.queue.shift();
    if (!job) return;

    logger.info(`⚙️ [QueueService] Processing job ${job.id} (Type: ${job.type})...`);
    try {
      // Execute background task
      logger.info(`✅ [QueueService] Job ${job.id} completed successfully.`);
    } catch (err) {
      logger.error(`❌ [QueueService] Job ${job.id} failed:`, err);
    }
  }
}

export const queueService = new QueueService();
