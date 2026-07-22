import fs from 'fs';
import path from 'path';
import { logger } from '../config/logger';

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

class StorageService {
  private localUploadDir = path.resolve(__dirname, '../../uploads');

  constructor() {
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  /**
   * Save file using local storage provider with AWS S3 / Cloud readiness
   */
  async uploadFile(filename: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.localUploadDir, safeName);

    fs.writeFileSync(filePath, buffer);
    logger.info(`📁 [StorageService] Saved file ${safeName} (${buffer.length} bytes) to local storage`);

    return {
      filename: safeName,
      url: `/uploads/${safeName}`,
      size: buffer.length,
      mimeType,
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    const filePath = path.join(this.localUploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`🗑️ [StorageService] Deleted file ${filename}`);
      return true;
    }
    return false;
  }
}

export const storageService = new StorageService();
