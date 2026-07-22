"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronScheduler = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = require("../config/logger");
exports.cronScheduler = {
    /**
     * Daily Inventory Check & Alert Scheduler
     */
    runDailyInventoryCheck: async () => {
        logger_1.logger.info('⏰ [CronScheduler] Running daily inventory replenishment audit...');
        try {
            const lowStockItems = await prisma_1.default.inventory.findMany({
                where: { quantity: { lte: 10 } },
                include: { product: true, warehouse: true },
            });
            logger_1.logger.info(`📋 [CronScheduler] Audit completed. Found ${lowStockItems.length} low-stock SKUs.`);
            return lowStockItems;
        }
        catch (err) {
            logger_1.logger.error('❌ [CronScheduler] Inventory audit error:', err);
        }
    },
    /**
     * Overdue Invoice Payment Reminder Scheduler
     */
    runInvoiceOverdueReminders: async () => {
        logger_1.logger.info('⏰ [CronScheduler] Checking for overdue unpaid invoices...');
        try {
            const overdue = await prisma_1.default.invoice.findMany({
                where: {
                    status: { not: 'PAID' },
                    dueDate: { lt: new Date() },
                },
            });
            logger_1.logger.info(`📋 [CronScheduler] Found ${overdue.length} overdue invoices.`);
            return overdue;
        }
        catch (err) {
            logger_1.logger.error('❌ [CronScheduler] Invoice reminder error:', err);
        }
    },
};
//# sourceMappingURL=scheduler.js.map