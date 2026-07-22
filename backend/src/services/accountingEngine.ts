import prisma from '../config/prisma';
import { logger } from '../config/logger';

export const accountingEngine = {
  /**
   * Automatically record Double-Entry Journal & Ledger Entries for Sales Revenue
   */
  recordSalesRevenue: async (orderNumber: string, amount: number) => {
    logger.info(`📒 [AccountingEngine] Recording sales revenue $${amount} for Order ${orderNumber}`);
    try {
      // Debit Accounts Receivable / Cash
      await prisma.journalEntry.create({
        data: {
          entryNumber: `JE-SALES-${orderNumber}`,
          accountName: 'Accounts Receivable',
          type: 'DEBIT',
          amount,
          description: `Sales revenue recorded for Order ${orderNumber}`,
        },
      });

      // Credit Sales Revenue
      await prisma.journalEntry.create({
        data: {
          entryNumber: `JE-SALES-${orderNumber}-CR`,
          accountName: 'Sales Revenue',
          type: 'CREDIT',
          amount,
          description: `Sales revenue credited for Order ${orderNumber}`,
        },
      });
    } catch (err) {
      logger.error('❌ [AccountingEngine] Sales revenue recording error:', err);
    }
  },

  /**
   * Automatically record Expense Entry
   */
  recordExpense: async (title: string, category: string, amount: number) => {
    logger.info(`📒 [AccountingEngine] Recording expense $${amount} (${category})`);
    try {
      await prisma.journalEntry.create({
        data: {
          entryNumber: `JE-EXP-${Date.now()}`,
          accountName: category,
          type: 'DEBIT',
          amount,
          description: title,
        },
      });
    } catch (err) {
      logger.error('❌ [AccountingEngine] Expense recording error:', err);
    }
  },
};
