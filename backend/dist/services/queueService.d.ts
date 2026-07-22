export interface QueueJob {
    id: string;
    type: 'EMAIL' | 'PDF_EXPORT' | 'CSV_IMPORT' | 'DB_BACKUP';
    data: Record<string, any>;
    createdAt: Date;
}
declare class QueueService {
    private queue;
    addJob(type: QueueJob['type'], data: Record<string, any>): Promise<string>;
    private processNextJob;
}
export declare const queueService: QueueService;
export {};
//# sourceMappingURL=queueService.d.ts.map