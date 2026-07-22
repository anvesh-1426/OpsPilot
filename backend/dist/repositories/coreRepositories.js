"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.productRepository = exports.customerRepository = exports.userRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
exports.userRepository = {
    findByEmail: (email) => prisma_1.default.user.findUnique({ where: { email } }),
    findById: (id) => prisma_1.default.user.findUnique({ where: { id } }),
    findAll: () => prisma_1.default.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
    create: (data) => prisma_1.default.user.create({ data }),
    update: (id, data) => prisma_1.default.user.update({ where: { id }, data }),
    updateRefreshToken: (id, refreshToken) => prisma_1.default.user.update({ where: { id }, data: { refreshToken, lastLogin: new Date() } }),
};
exports.customerRepository = {
    findMany: (where, skip, take) => prisma_1.default.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { id: true, name: true } } } }),
    count: (where) => prisma_1.default.customer.count({ where }),
    findById: (id) => prisma_1.default.customer.findUnique({
        where: { id },
        include: {
            assignedTo: { select: { id: true, name: true } },
            interactions: { orderBy: { createdAt: 'desc' }, take: 20, include: { createdBy: { select: { id: true, name: true } } } },
            notes: { orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { id: true, name: true } } } },
            orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        },
    }),
    create: (data) => prisma_1.default.customer.create({ data }),
    update: (id, data) => prisma_1.default.customer.update({ where: { id }, data }),
    delete: (id) => prisma_1.default.customer.delete({ where: { id } }),
    addInteraction: (data) => prisma_1.default.customerInteraction.create({ data, include: { createdBy: { select: { id: true, name: true } } } }),
    addNote: (data) => prisma_1.default.customerNote.create({ data, include: { createdBy: { select: { id: true, name: true } } } }),
};
exports.productRepository = {
    findMany: (where, skip, take) => prisma_1.default.product.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { category: true, supplier: { select: { id: true, name: true } }, inventory: { include: { warehouse: { select: { id: true, name: true } } } } },
    }),
    count: (where) => prisma_1.default.product.count({ where }),
    findById: (id) => prisma_1.default.product.findUnique({
        where: { id },
        include: { category: true, supplier: true, inventory: { include: { warehouse: true } }, stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 } },
    }),
    create: (data) => prisma_1.default.product.create({ data }),
    update: (id, data) => prisma_1.default.product.update({ where: { id }, data }),
    delete: (id) => prisma_1.default.product.update({ where: { id }, data: { isActive: false } }),
};
exports.orderRepository = {
    findMany: (where, skip, take) => prisma_1.default.order.findMany({
        where, skip, take, orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true, email: true } }, items: { include: { product: { select: { id: true, name: true, sku: true } } } }, createdBy: { select: { id: true, name: true } } },
    }),
    count: (where) => prisma_1.default.order.count({ where }),
    findById: (id) => prisma_1.default.order.findUnique({
        where: { id },
        include: { customer: true, items: { include: { product: true } }, invoice: true, createdBy: { select: { id: true, name: true } } },
    }),
    create: (data) => prisma_1.default.order.create({ data, include: { items: { include: { product: true } }, customer: true } }),
    updateStatus: (id, status) => prisma_1.default.order.update({ where: { id }, data: { status, deliveredAt: status === 'DELIVERED' ? new Date() : undefined } }),
};
//# sourceMappingURL=coreRepositories.js.map