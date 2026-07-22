"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLead = exports.updateLead = exports.createLead = exports.getLeads = exports.addNote = exports.addInteraction = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.getCustomers = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errorHandler_1 = require("../middlewares/errorHandler");
// ─── Pagination helper ────────────────────────────────────────────────────────
const getPagination = (query) => {
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(100, parseInt(query.limit || '20'));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
// ─── Customers ────────────────────────────────────────────────────────────────
const getCustomers = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const search = req.query.search;
        const status = req.query.status;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        const [customers, total] = await Promise.all([
            prisma_1.default.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { assignedTo: { select: { id: true, name: true } } },
            }),
            prisma_1.default.customer.count({ where }),
        ]);
        return res.json({
            success: true,
            data: customers,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.getCustomers = getCustomers;
const getCustomer = async (req, res, next) => {
    try {
        const id = req.params.id;
        const customer = await prisma_1.default.customer.findUnique({
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
        if (!customer)
            return next(new errorHandler_1.AppError('Customer not found.', 404));
        return res.json({ success: true, data: customer });
    }
    catch (err) {
        return next(err);
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res, next) => {
    try {
        const customer = await prisma_1.default.customer.create({ data: req.body });
        return res.status(201).json({ success: true, data: customer });
    }
    catch (err) {
        return next(err);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
    try {
        const id = req.params.id;
        const customer = await prisma_1.default.customer.update({ where: { id }, data: req.body });
        return res.json({ success: true, data: customer });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_1.default.customer.delete({ where: { id } });
        return res.json({ success: true, message: 'Customer deleted.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.deleteCustomer = deleteCustomer;
const addInteraction = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const interaction = await prisma_1.default.customerInteraction.create({
            data: { ...req.body, customerId, createdById: req.user.id },
            include: { createdBy: { select: { id: true, name: true } } },
        });
        return res.status(201).json({ success: true, data: interaction });
    }
    catch (err) {
        return next(err);
    }
};
exports.addInteraction = addInteraction;
const addNote = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const note = await prisma_1.default.customerNote.create({
            data: { content: req.body.content, customerId, createdById: req.user.id },
            include: { createdBy: { select: { id: true, name: true } } },
        });
        return res.status(201).json({ success: true, data: note });
    }
    catch (err) {
        return next(err);
    }
};
exports.addNote = addNote;
// ─── Leads ────────────────────────────────────────────────────────────────────
const getLeads = async (req, res, next) => {
    try {
        const { page, limit, skip } = getPagination(req.query);
        const search = req.query.search;
        const status = req.query.status;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        const [leads, total] = await Promise.all([
            prisma_1.default.lead.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { assignedTo: { select: { id: true, name: true } } },
            }),
            prisma_1.default.lead.count({ where }),
        ]);
        return res.json({
            success: true,
            data: leads,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (err) {
        return next(err);
    }
};
exports.getLeads = getLeads;
const createLead = async (req, res, next) => {
    try {
        const lead = await prisma_1.default.lead.create({ data: req.body });
        return res.status(201).json({ success: true, data: lead });
    }
    catch (err) {
        return next(err);
    }
};
exports.createLead = createLead;
const updateLead = async (req, res, next) => {
    try {
        const id = req.params.id;
        const lead = await prisma_1.default.lead.update({ where: { id }, data: req.body });
        return res.json({ success: true, data: lead });
    }
    catch (err) {
        return next(err);
    }
};
exports.updateLead = updateLead;
const deleteLead = async (req, res, next) => {
    try {
        const id = req.params.id;
        await prisma_1.default.lead.delete({ where: { id } });
        return res.json({ success: true, message: 'Lead deleted.' });
    }
    catch (err) {
        return next(err);
    }
};
exports.deleteLead = deleteLead;
//# sourceMappingURL=crmController.js.map