"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appEvents = void 0;
const events_1 = require("events");
const logger_1 = require("../config/logger");
const prisma_1 = __importDefault(require("../config/prisma"));
class AppEventEmitter extends events_1.EventEmitter {
}
exports.appEvents = new AppEventEmitter();
// ─── Event Handlers ────────────────────────────────────────────────────────────
// 1. Order Created Handler
exports.appEvents.on('OrderCreated', async (payload) => {
    logger_1.logger.info(`⚡ [Event: OrderCreated] Order ${payload.orderNumber} ($${payload.total}) created by User ${payload.userId}`);
    try {
        await prisma_1.default.notification.create({
            data: {
                userId: payload.userId,
                type: 'ORDER_CREATED',
                title: `Order ${payload.orderNumber} Created`,
                body: `New sales order ${payload.orderNumber} for $${payload.total.toFixed(2)} has been recorded.`,
            },
        });
    }
    catch (err) {
        logger_1.logger.error('❌ Error handling OrderCreated event:', err);
    }
});
// 2. Order Approved Handler
exports.appEvents.on('OrderApproved', async (payload) => {
    logger_1.logger.info(`⚡ [Event: OrderApproved] Order ${payload.orderNumber} approved`);
    try {
        await prisma_1.default.auditLog.create({
            data: {
                action: 'ORDER_APPROVED',
                entityType: 'ORDER',
                entityId: payload.orderId,
                details: JSON.stringify({ orderNumber: payload.orderNumber }),
            },
        });
    }
    catch (err) {
        logger_1.logger.error('❌ Error handling OrderApproved event:', err);
    }
});
// 3. Payment Received Handler
exports.appEvents.on('PaymentReceived', async (payload) => {
    logger_1.logger.info(`⚡ [Event: PaymentReceived] Payment of $${payload.amount} received via ${payload.method}`);
    try {
        await prisma_1.default.transaction.create({
            data: {
                type: 'INCOME',
                amount: payload.amount,
                description: `Payment received for Invoice ${payload.invoiceId}`,
                category: 'Sales Payment',
                reference: payload.invoiceId,
            },
        });
    }
    catch (err) {
        logger_1.logger.error('❌ Error handling PaymentReceived event:', err);
    }
});
// 4. Low Stock Alert Handler
exports.appEvents.on('LowStockAlert', async (payload) => {
    logger_1.logger.warn(`⚡ [Event: LowStockAlert] Product ${payload.sku} has low stock (${payload.qty}) in ${payload.warehouseName}`);
});
//# sourceMappingURL=eventEmitter.js.map