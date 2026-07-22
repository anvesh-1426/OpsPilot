import prisma from '../config/prisma';

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),
  findAll: () => prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true }, orderBy: { createdAt: 'desc' } }),
  create: (data: any) => prisma.user.create({ data }),
  update: (id: string, data: any) => prisma.user.update({ where: { id }, data }),
  updateRefreshToken: (id: string, refreshToken: string | null) => prisma.user.update({ where: { id }, data: { refreshToken, lastLogin: new Date() } }),
};

export const customerRepository = {
  findMany: (where: any, skip: number, take: number) =>
    prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { id: true, name: true } } } }),
  count: (where: any) => prisma.customer.count({ where }),
  findById: (id: string) =>
    prisma.customer.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        interactions: { orderBy: { createdAt: 'desc' }, take: 20, include: { createdBy: { select: { id: true, name: true } } } },
        notes: { orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { id: true, name: true } } } },
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    }),
  create: (data: any) => prisma.customer.create({ data }),
  update: (id: string, data: any) => prisma.customer.update({ where: { id }, data }),
  delete: (id: string) => prisma.customer.delete({ where: { id } }),
  addInteraction: (data: any) => prisma.customerInteraction.create({ data, include: { createdBy: { select: { id: true, name: true } } } }),
  addNote: (data: any) => prisma.customerNote.create({ data, include: { createdBy: { select: { id: true, name: true } } } }),
};

export const productRepository = {
  findMany: (where: any, skip: number, take: number) =>
    prisma.product.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { category: true, supplier: { select: { id: true, name: true } }, inventory: { include: { warehouse: { select: { id: true, name: true } } } } },
    }),
  count: (where: any) => prisma.product.count({ where }),
  findById: (id: string) =>
    prisma.product.findUnique({
      where: { id },
      include: { category: true, supplier: true, inventory: { include: { warehouse: true } }, stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 } },
    }),
  create: (data: any) => prisma.product.create({ data }),
  update: (id: string, data: any) => prisma.product.update({ where: { id }, data }),
  delete: (id: string) => prisma.product.update({ where: { id }, data: { isActive: false } }),
};

export const orderRepository = {
  findMany: (where: any, skip: number, take: number) =>
    prisma.order.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, name: true, email: true } }, items: { include: { product: { select: { id: true, name: true, sku: true } } } }, createdBy: { select: { id: true, name: true } } },
    }),
  count: (where: any) => prisma.order.count({ where }),
  findById: (id: string) =>
    prisma.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } }, invoice: true, createdBy: { select: { id: true, name: true } } },
    }),
  create: (data: any) => prisma.order.create({ data, include: { items: { include: { product: true } }, customer: true } }),
  updateStatus: (id: string, status: any) => prisma.order.update({ where: { id }, data: { status, deliveredAt: status === 'DELIVERED' ? new Date() : undefined } }),
};
