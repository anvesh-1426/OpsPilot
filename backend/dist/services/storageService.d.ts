export interface UploadResult {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
}
declare class StorageService {
    private localUploadDir;
    constructor();
    /**
     * Save file using local storage provider with AWS S3 / Cloud readiness
     */
    uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<UploadResult>;
    deleteFile(filename: string): Promise<boolean>;
}
export declare const storageService: StorageService;
export {};
//# sourceMappingURL=storageService.d.ts.map