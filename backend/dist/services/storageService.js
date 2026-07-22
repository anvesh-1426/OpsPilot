"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../config/logger");
class StorageService {
    constructor() {
        this.localUploadDir = path_1.default.resolve(__dirname, '../../uploads');
        if (!fs_1.default.existsSync(this.localUploadDir)) {
            fs_1.default.mkdirSync(this.localUploadDir, { recursive: true });
        }
    }
    /**
     * Save file using local storage provider with AWS S3 / Cloud readiness
     */
    async uploadFile(filename, buffer, mimeType) {
        const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path_1.default.join(this.localUploadDir, safeName);
        fs_1.default.writeFileSync(filePath, buffer);
        logger_1.logger.info(`📁 [StorageService] Saved file ${safeName} (${buffer.length} bytes) to local storage`);
        return {
            filename: safeName,
            url: `/uploads/${safeName}`,
            size: buffer.length,
            mimeType,
        };
    }
    async deleteFile(filename) {
        const filePath = path_1.default.join(this.localUploadDir, filename);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
            logger_1.logger.info(`🗑️ [StorageService] Deleted file ${filename}`);
            return true;
        }
        return false;
    }
}
exports.storageService = new StorageService();
//# sourceMappingURL=storageService.js.map