import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

// ─── Inventory ────────────────────────────────────────────────────────────────
export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const warehouseId = req.query.warehouseId as string;
    const lowStock = req.query.lowStock === 'true';

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (lowStock) {
      where.AND = [
        { quantity: { gt: 0 } },
        { minQuantity: { gt: 0 } },
      ];
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        product: { include: { category: true, supplier: { select: { id: true, name: true } } } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
      orderBy: { product: { name: 'asc' } },
    });

    const data = lowStock
      ? inventory.filter((i: any) => i.quantity <= i.minQuantity)
      : inventory;

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export const getStockMovements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '50'));
    const skip = (page - 1) * limit;
    const productId = req.query.productId as string;

    const where: any = {};
    if (productId) where.productId = productId;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return res.json({ success: true, data: movements, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const getInventorySummary = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalProducts, lowStockItems, outOfStock, totalValue] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.inventory.count({ where: { quantity: { gt: 0 }, minQuantity: { gt: 0 } } }),
      prisma.inventory.count({ where: { quantity: 0 } }),
      prisma.inventory.findMany({ include: { product: { select: { costPrice: true } } } }),
    ]);

    const inventoryValue = totalValue.reduce((sum: number, i: any) => sum + i.quantity * i.product.costPrice, 0);

    return res.json({
      success: true,
      data: { totalProducts, lowStockItems, outOfStock, inventoryValue },
    });
  } catch (err) {
    return next(err);
  }
};

// ─── Warehouses ───────────────────────────────────────────────────────────────
export const getWarehouses = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        inventory: { select: { quantity: true } },
        _count: { select: { inventory: true } },
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, data: warehouses });
  } catch (err) {
    return next(err);
  }
};

export const getWarehouse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        inventory: { include: { product: { include: { category: true } } } },
        locations: true,
        goodsReceived: { orderBy: { receivedAt: 'desc' }, take: 10 },
        dispatches: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    return res.json({ success: true, data: warehouse });
  } catch (err) {
    return next(err);
  }
};

export const createWarehouse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const warehouse = await prisma.warehouse.create({ data: req.body });
    return res.status(201).json({ success: true, data: warehouse });
  } catch (err) {
    return next(err);
  }
};

export const updateWarehouse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const warehouse = await prisma.warehouse.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: warehouse });
  } catch (err) {
    return next(err);
  }
};

export const deleteWarehouse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.warehouse.update({ where: { id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Warehouse deactivated.' });
  } catch (err) {
    return next(err);
  }
};

export const getPurchaseOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const limit = Math.min(100, parseInt((req.query.limit as string) || '20'));
    const skip = (page - 1) * limit;

    const [pos, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        },
      }),
      prisma.purchaseOrder.count(),
    ]);

    return res.json({ success: true, data: pos, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, ...poData } = req.body;
    const total = items.reduce((sum: number, i: any) => sum + i.quantity * i.unitCost, 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        ...poData,
        poNumber: `PO-${Date.now()}`,
        total,
        items: { create: items.map((i: any) => ({ ...i, total: i.quantity * i.unitCost })) },
      },
      include: { items: { include: { product: true } }, supplier: true, warehouse: true },
    });

    return res.status(201).json({ success: true, data: po });
  } catch (err) {
    return next(err);
  }
};
