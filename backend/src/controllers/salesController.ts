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

const generateOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateInvoiceNumber = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateQuoteNumber = () => `QUO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const generateChallanNumber = () => `CHAL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

// ─── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
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
      prisma.order.count({ where }),
    ]);

    return res.json({ success: true, data: orders, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
        invoice: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) return next(new AppError('Order not found.', 404));
    return res.json({ success: true, data: order });
  } catch (err) {
    return next(err);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, notes, shippingAddress } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Customer and items are required.', 400));
    }

    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    let totalTax = 0;
    const orderItemsData = items.map((item: any) => {
      const prod = productMap.get(item.productId);
      if (!prod) throw new AppError(`Product with ID ${item.productId} not found.`, 400);
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

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,
        createdById: req.user!.id,
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
  } catch (err) {
    return next(err);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return next(new AppError('Order not found.', 404));

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
    });

    return res.json({ success: true, message: `Order status updated to ${status}.`, data: updated });
  } catch (err) {
    return next(err);
  }
};

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const getInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
      prisma.invoice.count({ where }),
    ]);

    return res.json({ success: true, data: invoices, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, dueDate, notes } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
    if (!order) return next(new AppError('Order not found.', 404));

    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return next(new AppError('Invoice already exists for this order.', 400));

    const invoice = await prisma.invoice.create({
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
  } catch (err) {
    return next(err);
  }
};

export const addPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const invoiceId = req.params.id as string;
    const { amount, method, reference } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
    if (!invoice) return next(new AppError('Invoice not found.', 404));

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    const newStatus = totalPaid >= invoice.total ? 'PAID' : 'SENT';

    const payment = await prisma.payment.create({
      data: { invoiceId, amount, method, reference },
    });

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus, ...(newStatus === 'PAID' && { paidAt: new Date() }) },
    });

    return res.status(201).json({ success: true, message: 'Payment recorded.', data: payment });
  } catch (err) {
    return next(err);
  }
};

// ─── Quotations ───────────────────────────────────────────────────────────────
export const getQuotations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quotations = await prisma.quotation.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: quotations });
  } catch (err) {
    return next(err);
  }
};

export const createQuotation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, subtotal, taxAmount, discount, total, validUntil, notes } = req.body;
    const quotation = await prisma.quotation.create({
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
  } catch (err) {
    return next(err);
  }
};

// ─── Sales Challans (Delivery Challan Engine with Stock Guard & Snapshot) ─────
export const getChallans = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [challans, total] = await Promise.all([
      prisma.deliveryChallan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { include: { customer: true, items: { include: { product: true } } } },
          warehouse: true,
        },
      }),
      prisma.deliveryChallan.count({ where }),
    ]);

    return res.json({ success: true, data: challans, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, warehouseId, items, status = 'DRAFT', vehicleNo, driverName } = req.body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Customer and at least one product item are required.', 400));
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: warehouseId ? { id: warehouseId } : {},
    });
    if (!warehouse) return next(new AppError('Target warehouse not found.', 400));

    // Validate Stock Availability & Snapshot Creation
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { inventory: { where: { warehouseId: warehouse.id } } },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalQuantity = 0;
    const itemSnapshots = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) return next(new AppError(`Product ID ${item.productId} not found.`, 400));

      const currentStock = prod.inventory[0]?.quantity || 0;
      if (status === 'CONFIRMED' && currentStock < item.quantity) {
        return next(new AppError(`Insufficient stock for product ${prod.name} (SKU: ${prod.sku}). Available: ${currentStock}, Requested: ${item.quantity}.`, 400));
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
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-CHAL-${Date.now()}`,
        customerId,
        createdById: req.user!.id,
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
    const challan = await prisma.deliveryChallan.create({
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
        await prisma.inventory.updateMany({
          where: { productId: snap.productId, warehouseId: warehouse.id },
          data: { quantity: { decrement: snap.quantity } },
        });

        await prisma.stockMovement.create({
          data: {
            productId: snap.productId,
            warehouseId: warehouse.id,
            type: 'OUT',
            quantityChanged: -snap.quantity,
            quantityBefore: 0,
            quantityAfter: 0,
            reason: `Sales Delivery Challan ${challanNo} Confirmed`,
            createdById: req.user!.id,
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
  } catch (err) {
    return next(err);
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const challan = await prisma.deliveryChallan.findUnique({
      where: { id },
      include: { order: { include: { items: { include: { product: true } } } }, warehouse: true },
    });
    if (!challan) return next(new AppError('Delivery Challan not found.', 404));

    if (status === 'CONFIRMED' && challan.status !== 'CONFIRMED') {
      // Validate inventory before confirmation
      for (const item of challan.order.items) {
        const inv = await prisma.inventory.findFirst({
          where: { productId: item.productId, warehouseId: challan.warehouseId },
        });
        const currentStock = inv?.quantity || 0;
        if (currentStock < item.quantity) {
          return next(new AppError(`Insufficient stock for product ${item.product.name} (SKU: ${item.product.sku}). Available: ${currentStock}, Requested: ${item.quantity}.`, 400));
        }
      }

      // Deduct stock
      for (const item of challan.order.items) {
        await prisma.inventory.updateMany({
          where: { productId: item.productId, warehouseId: challan.warehouseId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }

    const updated = await prisma.deliveryChallan.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, message: `Challan status updated to ${status}.`, data: updated });
  } catch (err) {
    return next(err);
  }
};
