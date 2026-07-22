"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountingEngine = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = require("../config/logger");
exports.accountingEngine = {
    /**
     * Automatically record Double-Entry Journal & Ledger Entries for Sales Revenue
     */
    recordSalesRevenue: async (orderNumber, amount) => {
        logger_1.logger.info(`📒 [AccountingEngine] Recording sales revenue $${amount} for Order ${orderNumber}`);
        try {
            // Debit Accounts Receivable / Cash
            await prisma_1.default.journalEntry.create({
                data: {
                    entryNumber: `JE-SALES-${orderNumber}`,
                    accountName: 'Accounts Receivable',
                    type: 'DEBIT',
                    amount,
                    description: `Sales revenue recorded for Order ${orderNumber}`,
                },
            });
            // Credit Sales Revenue
            await prisma_1.default.journalEntry.create({
                data: {
                    entryNumber: `JE-SALES-${orderNumber}-CR`,
                    accountName: 'Sales Revenue',
                    type: 'CREDIT',
                    amount,
                    description: `Sales revenue credited for Order ${orderNumber}`,
                },
            });
        }
        catch (err) {
            logger_1.logger.error('❌ [AccountingEngine] Sales revenue recording error:', err);
        }
    },
    /**
     * Automatically record Expense Entry
     */
    recordExpense: async (title, category, amount) => {
        logger_1.logger.info(`📒 [AccountingEngine] Recording expense $${amount} (${category})`);
        try {
            await prisma_1.default.journalEntry.create({
                data: {
                    entryNumber: `JE-EXP-${Date.now()}`,
                    accountName: category,
                    type: 'DEBIT',
                    amount,
                    description: title,
                },
            });
        }
        catch (err) {
            logger_1.logger.error('❌ [AccountingEngine] Expense recording error:', err);
        }
    },
};
//# sourceMappingURL=accountingEngine.js.map