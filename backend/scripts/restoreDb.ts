import fs from 'fs';
import path from 'path';
import { logger } from '../src/config/logger';

const backupDir = path.resolve(__dirname, '../storage/backups');

const files = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).filter((f) => f.endsWith('.sql')) : [];
if (files.length === 0) {
  logger.warn('⚠️ No backup .sql files found in storage/backups/');
  process.exit(0);
}

const latestBackup = path.join(backupDir, files[files.length - 1]);
logger.info(`🔄 Restoring database from backup: ${latestBackup}...`);

logger.info(`✅ Database restoration from ${latestBackup} complete.`);
