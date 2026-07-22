import prisma from '../config/prisma';
import { logger } from '../config/logger';

export const cronScheduler = {
  /**
   * Daily Inventory Check & Alert Scheduler
   */
  runDailyInventoryCheck: async () => {
    logger.info('⏰ [CronScheduler] Running daily inventory replenishment audit...');
    try {
      const lowStockItems = await prisma.inventory.findMany({
        where: { quantity: { lte: 10 } },
        include: { product: true, warehouse: true },
      });

      logger.info(`📋 [CronScheduler] Audit completed. Found ${lowStockItems.length} low-stock SKUs.`);
      return lowStockItems;
    } catch (err) {
      logger.error('❌ [CronScheduler] Inventory audit error:', err);
    }
  },

  /**
   * Overdue Invoice Payment Reminder Scheduler
   */
  runInvoiceOverdueReminders: async () => {
    logger.info('⏰ [CronScheduler] Checking for overdue unpaid invoices...');
    try {
      const overdue = await prisma.invoice.findMany({
        where: {
          status: { not: 'PAID' },
          dueDate: { lt: new Date() },
        },
      });

      logger.info(`📋 [CronScheduler] Found ${overdue.length} overdue invoices.`);
      return overdue;
    } catch (err) {
      logger.error('❌ [CronScheduler] Invoice reminder error:', err);
    }
  },
};
