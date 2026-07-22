"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.purchaseService = exports.supplierService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
exports.supplierService = {
    getSuppliers: async () => {
        return prisma_1.default.supplier.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { products: true, purchaseOrders: true } },
            },
        });
    },
    getSupplier: async (id) => {
        return prisma_1.default.supplier.findUnique({
            where: { id },
            include: {
                products: true,
                purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10, include: { items: { include: { product: true } } } },
            },
        });
    },
    createSupplier: async (data) => prisma_1.default.supplier.create({ data }),
    updateSupplier: async (id, data) => prisma_1.default.supplier.update({ where: { id }, data }),
    deleteSupplier: async (id) => prisma_1.default.supplier.delete({ where: { id } }),
};
exports.purchaseService = {
    getPurchaseOrders: async (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            prisma_1.default.purchaseOrder.findMany({
                skip, take: limit, orderBy: { createdAt: 'desc' },
                include: { supplier: { select: { id: true, name: true } }, warehouse: { select: { id: true, name: true } }, items: { include: { product: true } } },
            }),
            prisma_1.default.purchaseOrder.count(),
        ]);
        return { orders, total, pages: Math.ceil(total / limit) };
    },
    createPurchaseOrder: async (data) => {
        const { items, ...poData } = data;
        const total = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
        return prisma_1.default.purchaseOrder.create({
            data: {
                ...poData,
                poNumber: `PO-${Date.now()}`,
                total,
                items: { create: items.map((i) => ({ ...i, total: i.quantity * i.unitCost })) },
            },
            include: { items: { include: { product: true } }, supplier: true, warehouse: true },
        });
    },
    receiveGoods: async (poId, receivedBy, notes) => {
        return prisma_1.default.$transaction(async (tx) => {
            const po = await tx.purchaseOrder.findUnique({ where: { id: poId }, include: { items: true } });
            if (!po)
                throw new Error('PO not found');
            const grn = await tx.goodsReceivedNote.create({
                data: {
                    grnNumber: `GRN-${Date.now()}`,
                    purchaseOrderId: po.id,
                    warehouseId: po.warehouseId,
                    receivedBy,
                    notes,
                },
            });
            // Increment inventory stock
            for (const item of po.items) {
                let inv = await tx.inventory.findUnique({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: po.warehouseId } },
                });
                if (!inv) {
                    inv = await tx.inventory.create({ data: { productId: item.productId, warehouseId: po.warehouseId, quantity: 0 } });
                }
                await tx.inventory.update({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: po.warehouseId } },
                    data: { quantity: inv.quantity + item.quantity },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: po.warehouseId,
                        type: 'IN',
                        quantityChanged: item.quantity,
                        quantityBefore: inv.quantity,
                        quantityAfter: inv.quantity + item.quantity,
                        reason: `GRN ${grn.grnNumber} for PO ${po.poNumber}`,
                        createdById: receivedBy,
                    },
                });
            }
            await tx.purchaseOrder.update({ where: { id: poId }, data: { status: 'RECEIVED' } });
            return grn;
        });
    },
};
exports.analyticsService = {
    getSalesAnalytics: async (timeframe = 'monthly') => {
        const orders = await prisma_1.default.order.findMany({
            where: { status: { not: 'CANCELLED' } },
            select: { total: true, createdAt: true },
        });
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = orders.length;
        return { totalRevenue, totalOrders, timeframe };
    },
    getInventoryAnalytics: async () => {
        const [items, totalVal] = await Promise.all([
            prisma_1.default.inventory.findMany({ include: { product: true, warehouse: true } }),
            prisma_1.default.inventory.findMany({ include: { product: { select: { costPrice: true } } } }),
        ]);
        const totalValue = totalVal.reduce((s, i) => s + i.quantity * i.product.costPrice, 0);
        const lowStock = items.filter((i) => i.quantity <= i.minQuantity && i.minQuantity > 0);
        const outOfStock = items.filter((i) => i.quantity === 0);
        return { totalValue, lowStockCount: lowStock.length, outOfStockCount: outOfStock.length, items };
    },
    getCustomerAnalytics: async () => {
        const [total, active, prospects] = await Promise.all([
            prisma_1.default.customer.count(),
            prisma_1.default.customer.count({ where: { status: 'ACTIVE' } }),
            prisma_1.default.customer.count({ where: { status: 'PROSPECT' } }),
        ]);
        const topCustomers = await prisma_1.default.customer.findMany({
            take: 5,
            orderBy: { totalRevenue: 'desc' },
            select: { id: true, name: true, totalRevenue: true, status: true },
        });
        return { total, active, prospects, topCustomers };
    },
};
//# sourceMappingURL=businessServices.js.map