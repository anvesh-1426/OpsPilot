import { EventEmitter } from 'events';
import { logger } from '../config/logger';
import prisma from '../config/prisma';

class AppEventEmitter extends EventEmitter {}

export const appEvents = new AppEventEmitter();

// ─── Event Handlers ────────────────────────────────────────────────────────────

// 1. Order Created Handler
appEvents.on('OrderCreated', async (payload: { orderId: string; orderNumber: string; total: number; userId: string }) => {
  logger.info(`⚡ [Event: OrderCreated] Order ${payload.orderNumber} ($${payload.total}) created by User ${payload.userId}`);
  try {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: 'ORDER_CREATED',
        title: `Order ${payload.orderNumber} Created`,
        body: `New sales order ${payload.orderNumber} for $${payload.total.toFixed(2)} has been recorded.`,
      },
    });
  } catch (err) {
    logger.error('❌ Error handling OrderCreated event:', err);
  }
});

// 2. Order Approved Handler
appEvents.on('OrderApproved', async (payload: { orderId: string; orderNumber: string; customerId: string }) => {
  logger.info(`⚡ [Event: OrderApproved] Order ${payload.orderNumber} approved`);
  try {
    await prisma.auditLog.create({
      data: {
        action: 'ORDER_APPROVED',
        entityType: 'ORDER',
        entityId: payload.orderId,
        details: JSON.stringify({ orderNumber: payload.orderNumber }),
      },
    });
  } catch (err) {
    logger.error('❌ Error handling OrderApproved event:', err);
  }
});

// 3. Payment Received Handler
appEvents.on('PaymentReceived', async (payload: { invoiceId: string; amount: number; method: string }) => {
  logger.info(`⚡ [Event: PaymentReceived] Payment of $${payload.amount} received via ${payload.method}`);
  try {
    await prisma.transaction.create({
      data: {
        type: 'INCOME',
        amount: payload.amount,
        description: `Payment received for Invoice ${payload.invoiceId}`,
        category: 'Sales Payment',
        reference: payload.invoiceId,
      },
    });
  } catch (err) {
    logger.error('❌ Error handling PaymentReceived event:', err);
  }
});

// 4. Low Stock Alert Handler
appEvents.on('LowStockAlert', async (payload: { productId: string; sku: string; qty: number; warehouseName: string }) => {
  logger.warn(`⚡ [Event: LowStockAlert] Product ${payload.sku} has low stock (${payload.qty}) in ${payload.warehouseName}`);
});
