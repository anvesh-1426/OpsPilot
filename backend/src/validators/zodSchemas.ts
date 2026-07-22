import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED']).optional(),
});

export const productSchema = z.object({
  sku: z.string().min(3, 'SKU is required'),
  name: z.string().min(2, 'Product name is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  costPrice: z.number().nonnegative('Cost price cannot be negative'),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  taxPercent: z.number().nonnegative().optional(),
});

export const orderSchema = z.object({
  customerId: z.string().uuid('Invalid Customer ID'),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      discount: z.number().nonnegative().optional(),
    })
  ).min(1, 'At least one order item is required'),
  notes: z.string().optional(),
  shippingAddress: z.string().optional(),
});
