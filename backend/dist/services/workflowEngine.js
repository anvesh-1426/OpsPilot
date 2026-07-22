"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowEngine = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = require("../config/logger");
exports.workflowEngine = {
    /**
     * Complete Interconnected Sales Order Approval Workflow:
     * Order Approved -> Auto Decrease Inventory -> Auto Create Warehouse Packing/Dispatch Request -> Auto Generate Invoice -> Auto Accounts Payment -> Update Analytics
     */
    processOrderApproval: async (orderId, approvedById) => {
        logger_1.logger.info(`🔄 [WorkflowEngine] Initiating automated order orchestration for Order ${orderId}`);
        return prisma_1.default.$transaction(async (tx) => {
            // 1. Fetch order with customer & items
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { product: true } }, customer: true },
            });
            if (!order)
                throw new Error(`Order ${orderId} not found`);
            if (order.status === 'CONFIRMED' || order.status === 'DELIVERED') {
                throw new Error(`Order ${order.orderNumber} is already processed`);
            }
            // 2. Auto-decrease inventory in Main Warehouse (WH-001) & check stock
            const mainWarehouse = await tx.warehouse.findFirst({ where: { code: 'WH-001' } });
            const warehouseId = mainWarehouse ? mainWarehouse.id : (await tx.warehouse.findFirst())?.id;
            if (!warehouseId)
                throw new Error('No active warehouse found');
            for (const item of order.items) {
                let inv = await tx.inventory.findUnique({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId } },
                });
                if (!inv || inv.quantity < item.quantity) {
                    logger_1.logger.warn(`⚠️ Low stock for product ${item.product.name} in warehouse. Auto-adjusting for fulfillment.`);
                    // If inventory record doesn't exist, create it
                    if (!inv) {
                        inv = await tx.inventory.create({
                            data: { productId: item.productId, warehouseId, quantity: item.quantity + 20, minQuantity: 10 },
                        });
                    }
                    else {
                        // Auto top-up for demo seamless workflow
                        await tx.inventory.update({
                            where: { productId_warehouseId: { productId: item.productId, warehouseId } },
                            data: { quantity: inv.quantity + item.quantity + 50 },
                        });
                        inv.quantity += item.quantity + 50;
                    }
                }
                const quantityBefore = inv.quantity;
                const quantityAfter = quantityBefore - item.quantity;
                // Decrease stock
                await tx.inventory.update({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId } },
                    data: { quantity: quantityAfter },
                });
                // Record stock movement
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId,
                        type: 'OUT',
                        quantityChanged: item.quantity,
                        quantityBefore,
                        quantityAfter,
                        reason: `Auto-fulfillment for Order ${order.orderNumber}`,
                        createdById: approvedById,
                    },
                });
            }
            // 3. Update Order status to CONFIRMED
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: 'CONFIRMED' },
            });
            // 4. Auto-generate Delivery Challan (Warehouse packing/dispatch request)
            const challanNumber = `CHAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const challan = await tx.deliveryChallan.create({
                data: {
                    challanNumber,
                    orderId: order.id,
                    warehouseId,
                    status: 'DISPATCHED',
                    vehicleNo: 'TRUCK-US-99',
                    driverName: 'Automated Fulfillment Dispatch',
                },
            });
            // 5. Auto-generate Invoice
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const invoice = await tx.invoice.create({
                data: {
                    invoiceNumber,
                    orderId: order.id,
                    customerId: order.customerId,
                    subtotal: order.subtotal,
                    taxAmount: order.taxAmount,
                    discountAmount: order.discountAmount,
                    total: order.total,
                    status: 'PAID',
                    paidAt: new Date(),
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    notes: 'Auto-generated invoice upon order confirmation.',
                },
            });
            // 6. Auto-record Accounts Payment & Transaction Entry
            const payment = await tx.payment.create({
                data: {
                    invoiceId: invoice.id,
                    amount: order.total,
                    method: 'BANK_TRANSFER',
                    reference: `AUTO-PAY-${invoice.invoiceNumber}`,
                    paidAt: new Date(),
                },
            });
            await tx.transaction.create({
                data: {
                    type: 'INCOME',
                    amount: order.total,
                    description: `Auto-credited payment for Invoice ${invoice.invoiceNumber}`,
                    reference: invoice.id,
                    category: 'Sales Income',
                },
            });
            // 7. Update Customer Total Revenue
            await tx.customer.update({
                where: { id: order.customerId },
                data: { totalRevenue: { increment: order.total } },
            });
            // 8. Create System Audit Log & Notification
            await tx.auditLog.create({
                data: {
                    userId: approvedById,
                    action: 'ORDER_APPROVED_WORKFLOW',
                    entityType: 'Order',
                    entityId: order.id,
                    details: JSON.stringify({ orderNumber: order.orderNumber, total: order.total, invoiceNumber: invoice.invoiceNumber }),
                },
            });
            await tx.notification.create({
                data: {
                    userId: approvedById,
                    type: 'ORDER_APPROVED',
                    title: `Order ${order.orderNumber} Approved & Processed`,
                    body: `Stock decreased, Invoice ${invoice.invoiceNumber} created, and payment recorded automatically.`,
                    link: '/sales/orders',
                },
            });
            logger_1.logger.info(`✅ [WorkflowEngine] Interconnected order approval workflow completed for ${order.orderNumber}`);
            return {
                order: updatedOrder,
                challan,
                invoice,
                payment,
            };
        });
    },
    /**
     * Purchase Order Workflow State Machine:
     * Draft -> Pending Approval -> Approved -> Ordered -> Received -> Inventory Auto-Updated
     */
    processPurchaseWorkflow: async (poId, nextStatus, userId) => {
        logger_1.logger.info(`🔄 [WorkflowEngine] Transitioning PO ${poId} to ${nextStatus}`);
        const po = await prisma_1.default.purchaseOrder.findUnique({ where: { id: poId }, include: { items: true } });
        if (!po)
            throw new Error('Purchase Order not found');
        if (nextStatus === 'RECEIVED') {
            // Trigger goods receipt & stock increment
            const { purchaseService } = await Promise.resolve().then(() => __importStar(require('./businessServices')));
            return purchaseService.receiveGoods(poId, userId, 'Auto-received via Workflow Engine');
        }
        return prisma_1.default.purchaseOrder.update({
            where: { id: poId },
            data: { status: nextStatus },
        });
    },
};
//# sourceMappingURL=workflowEngine.js.map