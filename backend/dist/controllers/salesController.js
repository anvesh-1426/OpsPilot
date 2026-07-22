"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanStatus = exports.createChallan = exports.getChallans = exports.createQuotation = exports.getQuotations = exports.addPayment = exports.createInvoice = exports.getInvoices = exports.updateOrderStatus = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errorHandler_1 = require("../middlewares/errorHandler");
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, parseInt(query.limit || '20'));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateQuoteNumber = () => `QUO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateChallanNumber = () => `CHAL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
// ─── Orders ───────────────────────────────────────────────────────────────────
const getOrders = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const status = req.query.status;
        const search = req.query.search;
        const where = {};
        if (status)
            where.status = status;
        if (search) {
            where.OR = [
                { orderNumber: { contains: search } },
                { customer: { name: { contains: search } } },
            ];
        }
        const [orders, total] = await Promise.all([
            prisma_1.default.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { id: true, name: true, email: true } },
                    items: { include: { product: { select: { id: true, name: true, sku: true } } } },
                    createdBy: { select: { id: true, name: true } },
                },
            }),
            prisma_1.default.order.count({ where }),
        ]);
        return res.json({ success: true, data: orders, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res, next) => {
    try {
        const id = req.params.id;
        const order = await prisma_1.default.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true } },
                invoice: true,
                createdBy: { select: { id: true, name: true, email: true } },
            },
        });
        if (!order)
            return next(new errorHandler_1.AppError('Order not found.', 404));
        return res.json({ success: true, data: order });
    }
    catch (err) {
        return next(err);
    }
};
exports.getOrder = getOrder;
const createOrder = async (req, res, next) => {
    try {
        const { customerId, items, notes, shippingAddress } = req.body;
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return next(new errorHandler_1.AppError('Customer and items are required.', 400));
        }
        const productIds = items.map((i) => i.productId);
        const dbProducts = await prisma_1.default.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(dbProducts.map((p) => [p.id, p]));
        let subtotal = 0;
        let totalTax = 0;
        const orderItemsData = items.map((item) => {
            const prod = productMap.get(item.productId);
            if (!prod)
                throw new errorHandler_1.AppError(`Product with ID ${item.productId} not found.`, 400);
            const unitPrice = item.unitPrice ?? prod.unitPrice;
            const itemSubtotal = unitPrice * item.quantity;
            const discount = item.discount || 0;
            const taxable = itemSubtotal - discount;
            const tax = (taxable * prod.taxPercent) / 100;
            const itemTotal = taxable + tax;
            subtotal += taxable;
            totalTax += tax;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                discount,
                tax,
                total: itemTotal,
            };
        });
        const total = subtotal + totalTax;
        const order = await prisma_1.default.order.create({
            data: {
                orderNumber: generateOrderNumber(),
                customerId,
                createdById: req.user.id,
                subtotal,
                taxAmount: totalTax,
                total,
                notes,
                shippingAddress,
                items: { createMany: { data: orderItemsData } },
            },
            include: {
                customer: true,
                items: { include: { product: true } },
            },
        });
        return res.status(201).json({ success: true, message: 'Order created successfully.', data: order });
    }
    catch (err) {
        return next(err);
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order)
            return next(new errorHandler_1.AppError('Order not found.', 404));
        const updated = await prisma_1.default.order.update({
            where: { id },
            data: {
                status,
                ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
            },
        });
        return res.json({ success: true, message: `Order status updated to ${status}.`, data: updated });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateOrderStatus = updateOrderStatus;
// ─── Invoices ─────────────────────────────────────────────────────────────────
const getInvoices = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const status = req.query.status;
        const where = {};
        if (status)
            where.status = status;
        const [invoices, total] = await Promise.all([
            prisma_1.default.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { id: true, name: true, email: true } },
                    order: { select: { id: true, orderNumber: true } },
                    payments: true,
                },
            }),
            prisma_1.default.invoice.count({ where }),
        ]);
        return res.json({ success: true, data: invoices, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getInvoices = getInvoices;
const createInvoice = async (req, res, next) => {
    try {
        const { orderId, dueDate, notes } = req.body;
        const order = await prisma_1.default.order.findUnique({ where: { id: orderId }, include: { customer: true } });
        if (!order)
            return next(new errorHandler_1.AppError('Order not found.', 404));
        const existing = await prisma_1.default.invoice.findUnique({ where: { orderId } });
        if (existing)
            return next(new errorHandler_1.AppError('Invoice already exists for this order.', 400));
        const invoice = await prisma_1.default.invoice.create({
            data: {
                invoiceNumber: generateInvoiceNumber(),
                orderId,
                customerId: order.customerId,
                subtotal: order.subtotal,
                taxAmount: order.taxAmount,
                discountAmount: order.discountAmount,
                total: order.total,
                dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 86400000),
                notes,
            },
            include: { customer: true, order: true },
        });
        return res.status(201).json({ success: true, message: 'Invoice created successfully.', data: invoice });
    }
    catch (err) {
        return next(err);
    }
};
exports.createInvoice = createInvoice;
const addPayment = async (req, res, next) => {
    try {
        const invoiceId = req.params.id;
        const { amount, method, reference } = req.body;
        const invoice = await prisma_1.default.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
        if (!invoice)
            return next(new errorHandler_1.AppError('Invoice not found.', 404));
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
        const newStatus = totalPaid >= invoice.total ? 'PAID' : 'SENT';
        const payment = await prisma_1.default.payment.create({
            data: { invoiceId, amount, method, reference },
        });
        await prisma_1.default.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus, ...(newStatus === 'PAID' && { paidAt: new Date() }) },
        });
        return res.status(201).json({ success: true, message: 'Payment recorded.', data: payment });
    }
    catch (err) {
        return next(err);
    }
};
exports.addPayment = addPayment;
// ─── Quotations ───────────────────────────────────────────────────────────────
const getQuotations = async (req, res, next) => {
    try {
        const quotations = await prisma_1.default.quotation.findMany({ orderBy: { createdAt: 'desc' } });
        return res.json({ success: true, data: quotations });
    }
    catch (err) {
        return next(err);
    }
};
exports.getQuotations = getQuotations;
const createQuotation = async (req, res, next) => {
    try {
        const { customerId, subtotal, taxAmount, discount, total, validUntil, notes } = req.body;
        const quotation = await prisma_1.default.quotation.create({
            data: {
                quoteNumber: generateQuoteNumber(),
                customerId,
                subtotal,
                taxAmount,
                discount,
                total,
                validUntil: validUntil ? new Date(validUntil) : null,
                notes,
            },
        });
        return res.status(201).json({ success: true, data: quotation });
    }
    catch (err) {
        return next(err);
    }
};
exports.createQuotation = createQuotation;
// ─── Sales Challans (Delivery Challan Engine with Stock Guard & Snapshot) ─────
const getChallans = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const status = req.query.status;
        const where = {};
        if (status)
            where.status = status;
        const [challans, total] = await Promise.all([
            prisma_1.default.deliveryChallan.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: { include: { customer: true, items: { include: { product: true } } } },
                    warehouse: true,
                },
            }),
            prisma_1.default.deliveryChallan.count({ where }),
        ]);
        return res.json({ success: true, data: challans, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getChallans = getChallans;
const createChallan = async (req, res, next) => {
    try {
        const { customerId, warehouseId, items, status = 'DRAFT', vehicleNo, driverName } = req.body;
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return next(new errorHandler_1.AppError('Customer and at least one product item are required.', 400));
        }
        const warehouse = await prisma_1.default.warehouse.findFirst({
            where: warehouseId ? { id: warehouseId } : {},
        });
        if (!warehouse)
            return next(new errorHandler_1.AppError('Target warehouse not found.', 400));
        // Validate Stock Availability & Snapshot Creation
        const productIds = items.map((i) => i.productId);
        const dbProducts = await prisma_1.default.product.findMany({
            where: { id: { in: productIds } },
            include: { inventory: { where: { warehouseId: warehouse.id } } },
        });
        const productMap = new Map(dbProducts.map((p) => [p.id, p]));
        let totalQuantity = 0;
        const itemSnapshots = [];
        for (const item of items) {
            const prod = productMap.get(item.productId);
            if (!prod)
                return next(new errorHandler_1.AppError(`Product ID ${item.productId} not found.`, 400));
            const currentStock = prod.inventory[0]?.quantity || 0;
            if (status === 'CONFIRMED' && currentStock < item.quantity) {
                return next(new errorHandler_1.AppError(`Insufficient stock for product ${prod.name} (SKU: ${prod.sku}). Available: ${currentStock}, Requested: ${item.quantity}.`, 400));
            }
            totalQuantity += item.quantity;
            itemSnapshots.push({
                productId: prod.id,
                sku: prod.sku,
                productName: prod.name,
                unitPrice: prod.unitPrice,
                quantity: item.quantity,
                total: prod.unitPrice * item.quantity,
            });
        }
        // Auto-create dummy sales order to bind delivery challan
        const challanNo = generateChallanNumber();
        const order = await prisma_1.default.order.create({
            data: {
                orderNumber: `ORD-CHAL-${Date.now()}`,
                customerId,
                createdById: req.user.id,
                subtotal: itemSnapshots.reduce((s, i) => s + i.total, 0),
                taxAmount: 0,
                total: itemSnapshots.reduce((s, i) => s + i.total, 0),
                status: status === 'CONFIRMED' ? 'PROCESSING' : 'DRAFT',
                items: {
                    createMany: {
                        data: itemSnapshots.map((snap) => ({
                            productId: snap.productId,
                            quantity: snap.quantity,
                            unitPrice: snap.unitPrice,
                            total: snap.total,
                        })),
                    },
                },
            },
        });
        // Create Delivery Challan
        const challan = await prisma_1.default.deliveryChallan.create({
            data: {
                challanNumber: challanNo,
                orderId: order.id,
                warehouseId: warehouse.id,
                status: status.toUpperCase(),
                vehicleNo,
                driverName,
            },
            include: {
                order: { include: { customer: true } },
                warehouse: true,
            },
        });
        // Deduct stock if confirmed
        if (status.toUpperCase() === 'CONFIRMED') {
            for (const snap of itemSnapshots) {
                await prisma_1.default.inventory.updateMany({
                    where: { productId: snap.productId, warehouseId: warehouse.id },
                    data: { quantity: { decrement: snap.quantity } },
                });
                await prisma_1.default.stockMovement.create({
                    data: {
                        productId: snap.productId,
                        warehouseId: warehouse.id,
                        type: 'OUT',
                        quantityChanged: -snap.quantity,
                        quantityBefore: 0,
                        quantityAfter: 0,
                        reason: `Sales Delivery Challan ${challanNo} Confirmed`,
                        createdById: req.user.id,
                    },
                });
            }
        }
        return res.status(201).json({
            success: true,
            message: `Delivery Challan ${challanNo} created (${status.toUpperCase()}).`,
            data: {
                ...challan,
                totalQuantity,
                snapshots: itemSnapshots,
            },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.createChallan = createChallan;
const updateChallanStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const challan = await prisma_1.default.deliveryChallan.findUnique({
            where: { id },
            include: { order: { include: { items: { include: { product: true } } } }, warehouse: true },
        });
        if (!challan)
            return next(new errorHandler_1.AppError('Delivery Challan not found.', 404));
        if (status === 'CONFIRMED' && challan.status !== 'CONFIRMED') {
            // Validate inventory before confirmation
            for (const item of challan.order.items) {
                const inv = await prisma_1.default.inventory.findFirst({
                    where: { productId: item.productId, warehouseId: challan.warehouseId },
                });
                const currentStock = inv?.quantity || 0;
                if (currentStock < item.quantity) {
                    return next(new errorHandler_1.AppError(`Insufficient stock for product ${item.product.name} (SKU: ${item.product.sku}). Available: ${currentStock}, Requested: ${item.quantity}.`, 400));
                }
            }
            // Deduct stock
            for (const item of challan.order.items) {
                await prisma_1.default.inventory.updateMany({
                    where: { productId: item.productId, warehouseId: challan.warehouseId },
                    data: { quantity: { decrement: item.quantity } },
                });
            }
        }
        const updated = await prisma_1.default.deliveryChallan.update({
            where: { id },
            data: { status },
        });
        return res.json({ success: true, message: `Challan status updated to ${status}.`, data: updated });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateChallanStatus = updateChallanStatus;
//# sourceMappingURL=salesController.js.map