"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPLSummary = exports.getTransactions = exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, parseInt(query.limit || '20'));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
// ─── Expenses ─────────────────────────────────────────────────────────────────
const getExpenses = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const [expenses, total] = await Promise.all([
            prisma_1.default.expense.findMany({ skip, take: limit, orderBy: { date: 'desc' } }),
            prisma_1.default.expense.count(),
        ]);
        return res.json({ success: true, data: expenses, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res, next) => {
    try {
        const expense = await prisma_1.default.expense.create({ data: req.body });
        await prisma_1.default.transaction.create({
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
    }
    catch (err) {
        return next(err);
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res, next) => {
    try {
        const id = req.params.id;
        const expense = await prisma_1.default.expense.update({ where: { id }, data: req.body });
        return res.json({ success: true, data: expense });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_1.default.expense.delete({ where: { id } });
        return res.json({ success: true, message: 'Expense deleted.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.deleteExpense = deleteExpense;
// ─── Transactions ─────────────────────────────────────────────────────────────
const getTransactions = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const type = req.query.type;
        const where = {};
        if (type)
            where.type = type;
        const [transactions, total] = await Promise.all([
            prisma_1.default.transaction.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
            prisma_1.default.transaction.count({ where }),
        ]);
        return res.json({ success: true, data: transactions, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        return next(err);
    }
};
exports.getTransactions = getTransactions;
// ─── P&L Summary ─────────────────────────────────────────────────────────────
const getPLSummary = async (req, res, next) => {
    try {
        const year = parseInt(req.query.year || new Date().getFullYear().toString());
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);
        const [income, expenses] = await Promise.all([
            prisma_1.default.payment.aggregate({
                _sum: { amount: true },
                where: { paidAt: { gte: startDate, lte: endDate } },
            }),
            prisma_1.default.expense.aggregate({
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
                prisma_1.default.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: mStart, lte: mEnd } } }),
                prisma_1.default.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: mStart, lte: mEnd } } }),
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
    }
    catch (err) {
        return next(err);
    }
};
exports.getPLSummary = getPLSummary;
//# sourceMappingURL=accountsController.js.map