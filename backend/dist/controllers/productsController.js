"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupplier = exports.createSupplier = exports.getSuppliers = exports.createCategory = exports.getCategories = exports.adjustStock = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errorHandler_1 = require("../middlewares/errorHandler");
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, parseInt(query.limit || '20'));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
// ─── Products ─────────────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const search = req.query.search;
        const categoryId = req.query.categoryId;
        const supplierId = req.query.supplierId;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId)
            where.categoryId = categoryId;
        if (supplierId)
            where.supplierId = supplierId;
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    supplier: { select: { id: true, name: true } },
                    inventory: { include: { warehouse: { select: { id: true, name: true } } } },
                },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        return res.json({
            success: true,
            data: products,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                supplier: true,
                inventory: { include: { warehouse: true } },
                stockMovements: { orderBy: { createdAt: 'desc' }, take: 20, include: { createdBy: { select: { id: true, name: true } } } },
            },
        });
        if (!product)
            return next(new errorHandler_1.AppError('Product not found.', 404));
        return res.json({ success: true, data: product });
    }
    catch (err) {
        return next(err);
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res, next) => {
    try {
        const { warehouseId, initialStock, ...productData } = req.body;
        const product = await prisma_1.default.$transaction(async (tx) => {
            const p = await tx.product.create({ data: productData });
            if (warehouseId && initialStock > 0) {
                await tx.inventory.create({
                    data: { productId: p.id, warehouseId, quantity: initialStock, minQuantity: productData.minStockAlertQty || 0 },
                });
                await tx.stockMovement.create({
                    data: {
                        productId: p.id,
                        warehouseId,
                        type: 'IN',
                        quantityChanged: initialStock,
                        quantityBefore: 0,
                        quantityAfter: initialStock,
                        reason: 'Initial stock',
                        createdById: req.user.id,
                    },
                });
            }
            return p;
        });
        return res.status(201).json({ success: true, data: product });
    }
    catch (err) {
        return next(err);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.default.product.update({ where: { id }, data: req.body });
        return res.json({ success: true, data: product });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_1.default.product.update({ where: { id }, data: { isActive: false } });
        return res.json({ success: true, message: 'Product deactivated.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.deleteProduct = deleteProduct;
const adjustStock = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { warehouseId, type, quantity, reason } = req.body;
        const result = await prisma_1.default.$transaction(async (tx) => {
            let inv = await tx.inventory.findUnique({
                where: { productId_warehouseId: { productId: id, warehouseId } },
            });
            if (!inv) {
                inv = await tx.inventory.create({ data: { productId: id, warehouseId, quantity: 0 } });
            }
            const before = inv.quantity;
            const after = type === 'IN' ? before + quantity : before - quantity;
            if (after < 0)
                throw new errorHandler_1.AppError('Insufficient stock.', 400);
            await tx.inventory.update({
                where: { productId_warehouseId: { productId: id, warehouseId } },
                data: { quantity: after },
            });
            await tx.stockMovement.create({
                data: {
                    productId: id,
                    warehouseId,
                    type,
                    quantityChanged: quantity,
                    quantityBefore: before,
                    quantityAfter: after,
                    reason,
                    createdById: req.user.id,
                },
            });
            return { before, after };
        });
        return res.json({ success: true, data: result });
    }
    catch (err) {
        return next(err);
    }
};
exports.adjustStock = adjustStock;
// ─── Categories ───────────────────────────────────────────────────────────────
const getCategories = async (_req, res, next) => {
    try {
        const categories = await prisma_1.default.category.findMany({ orderBy: { name: 'asc' } });
        return res.json({ success: true, data: categories });
    }
    catch (err) {
        return next(err);
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res, next) => {
    try {
        const cat = await prisma_1.default.category.create({ data: req.body });
        return res.status(201).json({ success: true, data: cat });
    }
    catch (err) {
        return next(err);
    }
};
exports.createCategory = createCategory;
// ─── Suppliers ────────────────────────────────────────────────────────────────
const getSuppliers = async (_req, res, next) => {
    try {
        const suppliers = await prisma_1.default.supplier.findMany({ orderBy: { name: 'asc' } });
        return res.json({ success: true, data: suppliers });
    }
    catch (err) {
        return next(err);
    }
};
exports.getSuppliers = getSuppliers;
const createSupplier = async (req, res, next) => {
    try {
        const supplier = await prisma_1.default.supplier.create({ data: req.body });
        return res.status(201).json({ success: true, data: supplier });
    }
    catch (err) {
        return next(err);
    }
};
exports.createSupplier = createSupplier;
const updateSupplier = async (req, res, next) => {
    try {
        const id = req.params.id;
        const supplier = await prisma_1.default.supplier.update({ where: { id }, data: req.body });
        return res.json({ success: true, data: supplier });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateSupplier = updateSupplier;
//# sourceMappingURL=productsController.js.map