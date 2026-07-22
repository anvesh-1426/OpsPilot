import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      pendingOrders,
      totalCustomers,
      newCustomers,
      lowStockItems,
      totalExpenses,
    ] = await Promise.all([
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfMonth } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED'] } } }),
      prisma.customer.count(),
      prisma.customer.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.inventory.count({ where: { quantity: { gt: 0 }, minQuantity: { gt: 0 } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: startOfMonth } } }),
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
  } catch (err) {
    return next(err);
  }
};

export const getRevenueChart = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const [revenue, orders] = await Promise.all([
        prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: start, lte: end } } }),
        prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]);
      data.push({
        month: start.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: revenue._sum.amount || 0,
        orders,
      });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export const getRecentActivity = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [recentOrders, recentCustomers] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, orderNumber: true, total: true, status: true, createdAt: true, customer: { select: { name: true } } },
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, status: true, createdAt: true },
      }),
    ]);
    return res.json({ success: true, data: { recentOrders, recentCustomers } });
  } catch (err) {
    return next(err);
  }
};

// ─── Global Search ────────────────────────────────────────────────────────────
export const globalSearch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const [customers, products, orders, invoices] = await Promise.all([
      prisma.customer.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
        take: 5,
        select: { id: true, name: true, email: true },
      }),
      prisma.product.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] },
        take: 5,
        select: { id: true, name: true, sku: true },
      }),
      prisma.order.findMany({
        where: { orderNumber: { contains: q, mode: 'insensitive' } },
        take: 5,
        select: { id: true, orderNumber: true, total: true, status: true },
      }),
      prisma.invoice.findMany({
        where: { invoiceNumber: { contains: q, mode: 'insensitive' } },
        take: 5,
        select: { id: true, invoiceNumber: true, total: true, status: true },
      }),
    ]);

    return res.json({
      success: true,
      data: [
        ...customers.map((c: any) => ({ ...c, type: 'customer', url: `/crm/customers/${c.id}` })),
        ...products.map((p: any) => ({ ...p, type: 'product', url: `/inventory/products/${p.id}` })),
        ...orders.map((o: any) => ({ ...o, type: 'order', url: `/sales/orders/${o.id}` })),
        ...invoices.map((i: any) => ({ ...i, type: 'invoice', url: `/sales/invoices/${i.id}` })),
      ],
    });
  } catch (err) {
    return next(err);
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unread = notifications.filter((n: any) => !n.read).length;
    return res.json({ success: true, data: notifications, meta: { unread } });
  } catch (err) {
    return next(err);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (id === 'all') {
      await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
    } else {
      await prisma.notification.update({ where: { id }, data: { read: true } });
    }
    return res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    return next(err);
  }
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: users });
  } catch (err) {
    return next(err);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: { ...req.body, passwordHash },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { password, ...rest } = req.body;
    const data: any = { ...rest };
    if (password) {
      const bcrypt = await import('bcryptjs');
      data.passwordHash = await bcrypt.hash(password, 12);
    }
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    return res.json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, parseInt(req.query.limit as string || '50'));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.auditLog.count(),
    ]);

    return res.json({ success: true, data: logs, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const getSettings = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany();
    const mapped = Object.fromEntries(settings.map((s: any) => [s.key, s.value]));
    return res.json({ success: true, data: mapped });
  } catch (err) {
    return next(err);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updates = Object.entries(req.body);
    await Promise.all(
      updates.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    return res.json({ success: true, message: 'Settings updated.' });
  } catch (err) {
    return next(err);
  }
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const getSalesReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const [orders, topProducts, paymentTotal] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { customer: { select: { name: true } }, items: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startDate, lte: endDate } } }),
    ]);

    return res.json({ success: true, data: { orders, topProducts, totalRevenue: paymentTotal._sum.amount || 0 } });
  } catch (err) {
    return next(err);
  }
};
