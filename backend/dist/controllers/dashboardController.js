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
exports.getSalesReport = exports.updateSettings = exports.getSettings = exports.getAuditLogs = exports.updateUser = exports.createUser = exports.getUsers = exports.markNotificationRead = exports.getNotifications = exports.globalSearch = exports.getRecentActivity = exports.getRevenueChart = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getDashboardStats = async (_req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [totalRevenue, lastMonthRevenue, totalOrders, pendingOrders, totalCustomers, newCustomers, lowStockItems, totalExpenses,] = await Promise.all([
            prisma_1.default.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfMonth } } }),
            prisma_1.default.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
            prisma_1.default.order.count(),
            prisma_1.default.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] } } }),
            prisma_1.default.customer.count(),
            prisma_1.default.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma_1.default.inventory.count({ where: { quantity: { gt: 0 }, minQuantity: { gt: 0 } } }),
            prisma_1.default.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: startOfMonth } } }),
        ]);
        return res.json({
            success: true,
            data: {
                revenue: { current: totalRevenue._sum.amount || 0, last: lastMonthRevenue._sum.amount || 0 },
                orders: { total: totalOrders, pending: pendingOrders },
                customers: { total: totalCustomers, new: newCustomers },
                lowStock: lowStockItems,
                expenses: totalExpenses._sum.amount || 0,
            },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.getDashboardStats = getDashboardStats;
const getRevenueChart = async (_req, res, next) => {
    try {
        const data = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const [revenue, orders] = await Promise.all([
                prisma_1.default.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: start, lte: end } } }),
                prisma_1.default.order.count({ where: { createdAt: { gte: start, lte: end } } }),
            ]);
            data.push({
                month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
                revenue: revenue._sum.amount || 0,
                orders,
            });
        }
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
};
exports.getRevenueChart = getRevenueChart;
const getRecentActivity = async (_req, res, next) => {
    try {
        const [recentOrders, recentCustomers] = await Promise.all([
            prisma_1.default.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, orderNumber: true, total: true, status: true, createdAt: true, customer: { select: { name: true } } },
            }),
            prisma_1.default.customer.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true, email: true, status: true, createdAt: true },
            }),
        ]);
        return res.json({ success: true, data: { recentOrders, recentCustomers } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getRecentActivity = getRecentActivity;
// ─── Global Search ────────────────────────────────────────────────────────────
const globalSearch = async (req, res, next) => {
    try {
        const q = req.query.q;
        if (!q || q.length < 2)
            return res.json({ success: true, data: [] });
        const [customers, products, orders, invoices] = await Promise.all([
            prisma_1.default.customer.findMany({
                where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
                take: 5,
                select: { id: true, name: true, email: true },
            }),
            prisma_1.default.product.findMany({
                where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] },
                take: 5,
                select: { id: true, name: true, sku: true },
            }),
            prisma_1.default.order.findMany({
                where: { orderNumber: { contains: q, mode: 'insensitive' } },
                take: 5,
                select: { id: true, orderNumber: true, total: true, status: true },
            }),
            prisma_1.default.invoice.findMany({
                where: { invoiceNumber: { contains: q, mode: 'insensitive' } },
                take: 5,
                select: { id: true, invoiceNumber: true, total: true, status: true },
            }),
        ]);
        return res.json({
            success: true,
            data: [
                ...customers.map((c) => ({ ...c, type: 'customer', url: `/crm/customers/${c.id}` })),
                ...products.map((p) => ({ ...p, type: 'product', url: `/inventory/products/${p.id}` })),
                ...orders.map((o) => ({ ...o, type: 'order', url: `/sales/orders/${o.id}` })),
                ...invoices.map((i) => ({ ...i, type: 'invoice', url: `/sales/invoices/${i.id}` })),
            ],
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.globalSearch = globalSearch;
// ─── Notifications ────────────────────────────────────────────────────────────
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        const unread = notifications.filter((n) => !n.read).length;
        return res.json({ success: true, data: notifications, meta: { unread } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (id === 'all') {
            await prisma_1.default.notification.updateMany({ where: { userId: req.user.id, read: false }, data: { read: true } });
        }
        else {
            await prisma_1.default.notification.update({ where: { id }, data: { read: true } });
        }
        return res.json({ success: true, message: 'Marked as read.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.markNotificationRead = markNotificationRead;
// ─── Admin ────────────────────────────────────────────────────────────────────
const getUsers = async (_req, res, next) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: users });
    }
    catch (err) {
        return next(err);
    }
};
exports.getUsers = getUsers;
const createUser = async (req, res, next) => {
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const passwordHash = await bcrypt.hash(req.body.password, 12);
        const user = await prisma_1.default.user.create({
            data: { ...req.body, passwordHash },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        });
        return res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        return next(err);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const { password, ...rest } = req.body;
        const data = { ...rest };
        if (password) {
            const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
            data.passwordHash = await bcrypt.hash(password, 12);
        }
        const user = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data,
            select: { id: true, name: true, email: true, role: true, isActive: true },
        });
        return res.json({ success: true, data: user });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateUser = updateUser;
const getAuditLogs = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1'));
        const limit = Math.min(100, parseInt(req.query.limit || '50'));
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, name: true, email: true } } },
            }),
            prisma_1.default.auditLog.count(),
        ]);
        return res.json({ success: true, data: logs, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getAuditLogs = getAuditLogs;
const getSettings = async (_req, res, next) => {
    try {
        const settings = await prisma_1.default.setting.findMany();
        const mapped = Object.fromEntries(settings.map((s) => [s.key, s.value]));
        return res.json({ success: true, data: mapped });
    }
    catch (err) {
        return next(err);
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res, next) => {
    try {
        const updates = Object.entries(req.body);
        await Promise.all(updates.map(([key, value]) => prisma_1.default.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        })));
        return res.json({ success: true, message: 'Settings updated.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateSettings = updateSettings;
// ─── Reports ──────────────────────────────────────────────────────────────────
const getSalesReport = async (req, res, next) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const [orders, topProducts, paymentTotal] = await Promise.all([
            prisma_1.default.order.findMany({
                where: { createdAt: { gte: startDate, lte: endDate } },
                include: { customer: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.orderItem.groupBy({
                by: ['productId'],
                _sum: { quantity: true, total: true },
                orderBy: { _sum: { total: 'desc' } },
                take: 10,
            }),
            prisma_1.default.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startDate, lte: endDate } } }),
        ]);
        return res.json({ success: true, data: { orders, topProducts, totalRevenue: paymentTotal._sum.amount || 0 } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getSalesReport = getSalesReport;
//# sourceMappingURL=dashboardController.js.map