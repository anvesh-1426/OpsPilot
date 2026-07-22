"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.productSchema = exports.customerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name is required'),
    email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED']).optional(),
});
exports.productSchema = zod_1.z.object({
    sku: zod_1.z.string().min(3, 'SKU is required'),
    name: zod_1.z.string().min(2, 'Product name is required'),
    unitPrice: zod_1.z.number().positive('Unit price must be positive'),
    costPrice: zod_1.z.number().nonnegative('Cost price cannot be negative'),
    categoryId: zod_1.z.string().optional(),
    brandId: zod_1.z.string().optional(),
    supplierId: zod_1.z.string().optional(),
    taxPercent: zod_1.z.number().nonnegative().optional(),
});
exports.orderSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Invalid Customer ID'),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive(),
        discount: zod_1.z.number().nonnegative().optional(),
    })).min(1, 'At least one order item is required'),
    notes: zod_1.z.string().optional(),
    shippingAddress: zod_1.z.string().optional(),
});
//# sourceMappingURL=zodSchemas.js.map