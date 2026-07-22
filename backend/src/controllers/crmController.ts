import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';
import { AppError } from '../middlewares/errorHandler';

// ─── Pagination helper ────────────────────────────────────────────────────────
const getPagination = (query: any) => {
  const page = Math.max(1, parseInt((query.page as string) || '1'));
  const limit = Math.min(100, parseInt((query.limit as string) || '20'));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const getCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search as string;
    const status = req.query.status as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { id: true, name: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    return res.json({
      success: true,
      data: customers,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

export const getCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { createdBy: { select: { id: true, name: true } } },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { createdBy: { select: { id: true, name: true } } },
        },
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!customer) return next(new AppError('Customer not found.', 404));
    return res.json({ success: true, data: customer });
  } catch (err) {
    return next(err);
  }
};

export const createCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });
    return res.status(201).json({ success: true, data: customer });
  } catch (err) {
    return next(err);
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: customer });
  } catch (err) {
    return next(err);
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.customer.delete({ where: { id } });
    return res.json({ success: true, message: 'Customer deleted.' });
  } catch (err) {
    return next(err);
  }
};

export const addInteraction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id as string;
    const interaction = await prisma.customerInteraction.create({
      data: { ...req.body, customerId, createdById: req.user!.id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return res.status(201).json({ success: true, data: interaction });
  } catch (err) {
    return next(err);
  }
};

export const addNote = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id as string;
    const note = await prisma.customerNote.create({
      data: { content: req.body.content, customerId, createdById: req.user!.id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    return res.status(201).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
};

// ─── Leads ────────────────────────────────────────────────────────────────────
export const getLeads = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const search = req.query.search as string;
    const status = req.query.status as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { id: true, name: true } } },
      }),
      prisma.lead.count({ where }),
    ]);

    return res.json({
      success: true,
      data: leads,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return next(err);
  }
};

export const createLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const lead = await prisma.lead.create({ data: req.body });
    return res.status(201).json({ success: true, data: lead });
  } catch (err) {
    return next(err);
  }
};

export const updateLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const lead = await prisma.lead.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: lead });
  } catch (err) {
    return next(err);
  }
};

export const deleteLead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.lead.delete({ where: { id } });
    return res.json({ success: true, message: 'Lead deleted.' });
  } catch (err) {
    return next(err);
  }
};
