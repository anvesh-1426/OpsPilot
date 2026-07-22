import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

const getPagination = (query: any) => {
  const page = Math.max(1, parseInt((query.page as string) || '1'));
  const limit = Math.min(100, parseInt((query.limit as string) || '20'));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const getExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({ skip, take: limit, orderBy: { date: 'desc' } }),
      prisma.expense.count(),
    ]);
    return res.json({ success: true, data: expenses, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

export const createExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await prisma.expense.create({ data: req.body });
    await prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        amount: expense.amount,
        description: expense.title,
        category: expense.category,
        reference: expense.id,
        date: expense.date,
      },
    });
    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    return next(err);
  }
};

export const updateExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const expense = await prisma.expense.update({ where: { id }, data: req.body });
    return res.json({ success: true, data: expense });
  } catch (err) {
    return next(err);
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await prisma.expense.delete({ where: { id } });
    return res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    return next(err);
  }
};

// ─── Transactions ─────────────────────────────────────────────────────────────
export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const type = req.query.type as string;

    const where: any = {};
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
      prisma.transaction.count({ where }),
    ]);
    return res.json({ success: true, data: transactions, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    return next(err);
  }
};

// ─── P&L Summary ─────────────────────────────────────────────────────────────
export const getPLSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string || new Date().getFullYear().toString());
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const [income, expenses] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: startDate, lte: endDate } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: startDate, lte: endDate } },
      }),
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const netProfit = totalIncome - totalExpenses;

    // Monthly breakdown
    const monthly = [];
    for (let m = 0; m < 12; m++) {
      const mStart = new Date(year, m, 1);
      const mEnd = new Date(year, m + 1, 0, 23, 59, 59);

      const [mIncome, mExpenses] = await Promise.all([
        prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: mStart, lte: mEnd } } }),
        prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: mStart, lte: mEnd } } }),
      ]);

      monthly.push({
        month: mStart.toLocaleString('default', { month: 'short' }),
        income: mIncome._sum.amount || 0,
        expenses: mExpenses._sum.amount || 0,
        profit: (mIncome._sum.amount || 0) - (mExpenses._sum.amount || 0),
      });
    }

    return res.json({
      success: true,
      data: { totalIncome, totalExpenses, netProfit, profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0, monthly },
    });
  } catch (err) {
    return next(err);
  }
};
