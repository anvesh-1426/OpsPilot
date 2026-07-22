"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPurchaseOrder = exports.getPurchaseOrders = exports.deleteWarehouse = exports.updateWarehouse = exports.createWarehouse = exports.getWarehouse = exports.getWarehouses = exports.getInventorySummary = exports.getStockMovements = exports.getInventory = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// ─── Inventory ────────────────────────────────────────────────────────────────
const getInventory = async (req, res, next) => {
    try {
        const warehouseId = req.query.warehouseId;
        const lowStock = req.query.lowStock === 'true';
        const where = {};
        if (warehouseId)
            where.warehouseId = warehouseId;
        if (lowStock) {
            where.AND = [
                { quantity: { gt: 0 } },
                { minQuantity: { gt: 0 } },
            ];
        }
        const inventory = await prisma_1.default.inventory.findMany({
            where,
            include: {
                product: { include: { category: true, supplier: { select: { id: true, name: true } } } },
                warehouse: { select: { id: true, name: true, code: true } },
            },
            orderBy: { product: { name: 'asc' } },
        });
        const data = lowStock
            ? inventory.filter((i) => i.quantity <= i.minQuantity)
            : inventory;
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
};
exports.getInventory = getInventory;
const getStockMovements = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '50'));
        const skip = (page - 1) * limit;
        const productId = req.query.productId;
        const where = {};
        if (productId)
            where.productId = productId;
        const [movements, total] = await Promise.all([
            prisma_1.default.stockMovement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { id: true, name: true, sku: true } },
                    createdBy: { select: { id: true, name: true } },
                },
            }),
            prisma_1.default.stockMovement.count({ where }),
        ]);
        return res.json({ success: true, data: movements, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getStockMovements = getStockMovements;
const getInventorySummary = async (_req, res, next) => {
    try {
        const [totalProducts, lowStockItems, outOfStock, totalValue] = await Promise.all([
            prisma_1.default.product.count({ where: { isActive: true } }),
            prisma_1.default.inventory.count({ where: { quantity: { gt: 0 }, minQuantity: { gt: 0 } } }),
            prisma_1.default.inventory.count({ where: { quantity: 0 } }),
            prisma_1.default.inventory.findMany({ include: { product: { select: { costPrice: true } } } }),
        ]);
        const inventoryValue = totalValue.reduce((sum, i) => sum + i.quantity * i.product.costPrice, 0);
        return res.json({
            success: true,
            data: { totalProducts, lowStockItems, outOfStock, inventoryValue },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.getInventorySummary = getInventorySummary;
// ─── Warehouses ───────────────────────────────────────────────────────────────
const getWarehouses = async (_req, res, next) => {
    try {
        const warehouses = await prisma_1.default.warehouse.findMany({
            include: {
                inventory: { select: { quantity: true } },
                _count: { select: { inventory: true } },
            },
            orderBy: { name: 'asc' },
        });
        return res.json({ success: true, data: warehouses });
    }
    catch (err) {
        return next(err);
    }
};
exports.getWarehouses = getWarehouses;
const getWarehouse = async (req, res, next) => {
    try {
        const id = req.params.id;
        const warehouse = await prisma_1.default.warehouse.findUnique({
            where: { id },
            include: {
                inventory: { include: { product: { include: { category: true } } } },
                locations: true,
                goodsReceived: { orderBy: { receivedAt: 'desc' }, take: 10 },
                dispatches: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        return res.json({ success: true, data: warehouse });
    }
    catch (err) {
        return next(err);
    }
};
exports.getWarehouse = getWarehouse;
const createWarehouse = async (req, res, next) => {
    try {
        const warehouse = await prisma_1.default.warehouse.create({ data: req.body });
        return res.status(201).json({ success: true, data: warehouse });
    }
    catch (err) {
        return next(err);
    }
};
exports.createWarehouse = createWarehouse;
const updateWarehouse = async (req, res, next) => {
    try {
        const id = req.params.id;
        const warehouse = await prisma_1.default.warehouse.update({ where: { id }, data: req.body });
        return res.json({ success: true, data: warehouse });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateWarehouse = updateWarehouse;
const deleteWarehouse = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_1.default.warehouse.update({ where: { id }, data: { isActive: false } });
        return res.json({ success: true, message: 'Warehouse deactivated.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.deleteWarehouse = deleteWarehouse;
const getPurchaseOrders = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '20'));
        const skip = (page - 1) * limit;
        const [pos, total] = await Promise.all([
            prisma_1.default.purchaseOrder.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    supplier: { select: { id: true, name: true } },
                    warehouse: { select: { id: true, name: true } },
                    items: { include: { product: { select: { id: true, name: true, sku: true } } } },
                },
            }),
            prisma_1.default.purchaseOrder.count(),
        ]);
        return res.json({ success: true, data: pos, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getPurchaseOrders = getPurchaseOrders;
const createPurchaseOrder = async (req, res, next) => {
    try {
        const { items, ...poData } = req.body;
        const total = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
        const po = await prisma_1.default.purchaseOrder.create({
            data: {
                ...poData,
                poNumber: `PO-${Date.now()}`,
                total,
                items: { create: items.map((i) => ({ ...i, total: i.quantity * i.unitCost })) },
            },
            include: { items: { include: { product: true } }, supplier: true, warehouse: true },
        });
        return res.status(201).json({ success: true, data: po });
    }
    catch (err) {
        return next(err);
    }
};
exports.createPurchaseOrder = createPurchaseOrder;
//# sourceMappingURL=inventoryController.js.map