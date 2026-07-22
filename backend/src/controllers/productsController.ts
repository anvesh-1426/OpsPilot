import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

const getPagination = (query: any) => {
  const page = Math.max(1, parseInt((query.page as string) || '1'));
  const limit = Math.min(100, parseInt((query.limit as string) || '20'));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const supplierId = req.query.supplierId as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      data: products,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

export const getProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventory: { include: { warehouse: true } },
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 20, include: { createdBy: { select: { id: true, name: true } } } },
      },
    });
    if (!product) return next(new AppError('Product not found.', 404));
    return res.json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { warehouseId, initialStock, ...productData } = req.body;
    const product = await prisma.$transaction(async (tx: any) => {
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
            createdById: req.user!.id,
          },
        });
      }
      return p;
    });
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: product });
  } catch (err) {
    return next(err);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) {
    return next(err);
  }
};

export const adjustStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { warehouseId, type, quantity, reason } = req.body;
    const result = await prisma.$transaction(async (tx: any) => {
      let inv = await tx.inventory.findUnique({
        where: { productId_warehouseId: { productId: id, warehouseId } },
      });
      if (!inv) {
        inv = await tx.inventory.create({ data: { productId: id, warehouseId, quantity: 0 } });
      }
      const before = inv.quantity;
      const after = type === 'IN' ? before + quantity : before - quantity;
      if (after < 0) throw new AppError('Insufficient stock.', 400);
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
          createdById: req.user!.id,
        },
      });
      return { before, after };
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: categories });
  } catch (err) {
    return next(err);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cat = await prisma.category.create({ data: req.body });
    return res.status(201).json({ success: true, data: cat });
  } catch (err) {
    return next(err);
  }
};

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const getSuppliers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: suppliers });
  } catch (err) {
    return next(err);
  }
};

export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body });
    return res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    return next(err);
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const supplier = await prisma.supplier.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: supplier });
  } catch (err) {
    return next(err);
  }
};
