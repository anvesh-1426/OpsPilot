import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const customerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        CHURNED: "CHURNED";
        INACTIVE: "INACTIVE";
        PROSPECT: "PROSPECT";
    }>>;
}, z.core.$strip>;
export declare const productSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    unitPrice: z.ZodNumber;
    costPrice: z.ZodNumber;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    supplierId: z.ZodOptional<z.ZodString>;
    taxPercent: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const orderSchema: z.ZodObject<{
    customerId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        discount: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    notes: z.ZodOptional<z.ZodString>;
    shippingAddress: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=zodSchemas.d.ts.map