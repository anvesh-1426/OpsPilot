export declare const userRepository: {
    findByEmail: (email: string) => import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: string;
        avatar: string | null;
        phone: string | null;
        isActive: boolean;
        refreshToken: string | null;
        lastLogin: Date | null;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findById: (id: string) => import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: string;
        avatar: string | null;
        phone: string | null;
        isActive: boolean;
        refreshToken: string | null;
        lastLogin: Date | null;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll: () => import(".prisma/client").Prisma.PrismaPromise<{
        createdAt: Date;
        email: string;
        id: string;
        isActive: boolean;
        lastLogin: Date | null;
        name: string;
        role: string;
    }[]>;
    create: (data: any) => import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: string;
        avatar: string | null;
        phone: string | null;
        isActive: boolean;
        refreshToken: string | null;
        lastLogin: Date | null;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update: (id: string, data: any) => import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: string;
        avatar: string | null;
        phone: string | null;
        isActive: boolean;
        refreshToken: string | null;
        lastLogin: Date | null;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateRefreshToken: (id: string, refreshToken: string | null) => import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: string;
        avatar: string | null;
        phone: string | null;
        isActive: boolean;
        refreshToken: string | null;
        lastLogin: Date | null;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
};
export declare const customerRepository: {
    findMany: (where: any, skip: number, take: number) => import(".prisma/client").Prisma.PrismaPromise<({
        assignedTo: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        taxId: string | null;
        status: string;
        assignedToId: string | null;
        totalRevenue: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    count: (where: any) => import(".prisma/client").Prisma.PrismaPromise<number>;
    findById: (id: string) => import(".prisma/client").Prisma.Prisma__CustomerClient<({
        assignedTo: {
            id: string;
            name: string;
        } | null;
        interactions: ({
            createdBy: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            customerId: string;
            type: string;
            subject: string;
            body: string | null;
            createdById: string;
            createdAt: Date;
        })[];
        notes: ({
            createdBy: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            customerId: string;
            content: string;
            createdById: string;
            createdAt: Date;
        })[];
        orders: {
            id: string;
            orderNumber: string;
            customerId: string;
            status: string;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            total: number;
            notes: string | null;
            shippingAddress: string | null;
            createdById: string;
            expectedAt: Date | null;
            deliveredAt: Date | null;
            version: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        }[];
    } & {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        taxId: string | null;
        status: string;
        assignedToId: string | null;
        totalRevenue: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create: (data: any) => import(".prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        taxId: string | null;
        status: string;
        assignedToId: string | null;
        totalRevenue: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update: (id: string, data: any) => import(".prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        taxId: string | null;
        status: string;
        assignedToId: string | null;
        totalRevenue: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    delete: (id: string) => import(".prisma/client").Prisma.Prisma__CustomerClient<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        address: string | null;
        city: string | null;
        country: string | null;
        taxId: string | null;
        status: string;
        assignedToId: string | null;
        totalRevenue: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    addInteraction: (data: any) => import(".prisma/client").Prisma.Prisma__CustomerInteractionClient<{
        createdBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        customerId: string;
        type: string;
        subject: string;
        body: string | null;
        createdById: string;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    addNote: (data: any) => import(".prisma/client").Prisma.Prisma__CustomerNoteClient<{
        createdBy: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        customerId: string;
        content: string;
        createdById: string;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
};
export declare const productRepository: {
    findMany: (where: any, skip: number, take: number) => import(".prisma/client").Prisma.PrismaPromise<({
        category: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        inventory: ({
            warehouse: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            productId: string;
            warehouseId: string;
            quantity: number;
            minQuantity: number;
            updatedAt: Date;
        })[];
        supplier: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        categoryId: string | null;
        brandId: string | null;
        supplierId: string | null;
        unitPrice: number;
        costPrice: number;
        taxPercent: number;
        unit: string;
        barcode: string | null;
        isActive: boolean;
        minStockAlertQty: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    count: (where: any) => import(".prisma/client").Prisma.PrismaPromise<number>;
    findById: (id: string) => import(".prisma/client").Prisma.Prisma__ProductClient<({
        category: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        inventory: ({
            warehouse: {
                id: string;
                name: string;
                code: string;
                address: string | null;
                city: string | null;
                country: string | null;
                capacity: number | null;
                isActive: boolean;
                version: number;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            productId: string;
            warehouseId: string;
            quantity: number;
            minQuantity: number;
            updatedAt: Date;
        })[];
        stockMovements: {
            id: string;
            productId: string;
            warehouseId: string;
            type: string;
            quantityChanged: number;
            quantityBefore: number;
            quantityAfter: number;
            reason: string;
            createdById: string;
            createdAt: Date;
        }[];
        supplier: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            country: string | null;
            version: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        } | null;
    } & {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        categoryId: string | null;
        brandId: string | null;
        supplierId: string | null;
        unitPrice: number;
        costPrice: number;
        taxPercent: number;
        unit: string;
        barcode: string | null;
        isActive: boolean;
        minStockAlertQty: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create: (data: any) => import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        categoryId: string | null;
        brandId: string | null;
        supplierId: string | null;
        unitPrice: number;
        costPrice: number;
        taxPercent: number;
        unit: string;
        barcode: string | null;
        isActive: boolean;
        minStockAlertQty: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update: (id: string, data: any) => import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        categoryId: string | null;
        brandId: string | null;
        supplierId: string | null;
        unitPrice: number;
        costPrice: number;
        taxPercent: number;
        unit: string;
        barcode: string | null;
        isActive: boolean;
        minStockAlertQty: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    delete: (id: string) => import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: string;
        sku: string;
        name: string;
        description: string | null;
        categoryId: string | null;
        brandId: string | null;
        supplierId: string | null;
        unitPrice: number;
        costPrice: number;
        taxPercent: number;
        unit: string;
        barcode: string | null;
        isActive: boolean;
        minStockAlertQty: number;
        version: number;
        createdBy: string | null;
        updatedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
};
export declare const orderRepository: {
    findMany: (where: any, skip: number, take: number) => import(".prisma/client").Prisma.PrismaPromise<({
        createdBy: {
            id: string;
            name: string;
        };
        customer: {
            email: string | null;
            id: string;
            name: string;
        };
        items: ({
            product: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            discount: number;
            tax: number;
            total: number;
        })[];
    } & {
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        total: number;
        notes: string | null;
        shippingAddress: string | null;
        createdById: string;
        expectedAt: Date | null;
        deliveredAt: Date | null;
        version: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    })[]>;
    count: (where: any) => import(".prisma/client").Prisma.PrismaPromise<number>;
    findById: (id: string) => import(".prisma/client").Prisma.Prisma__OrderClient<({
        createdBy: {
            id: string;
            name: string;
        };
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            country: string | null;
            taxId: string | null;
            status: string;
            assignedToId: string | null;
            totalRevenue: number;
            version: number;
            createdBy: string | null;
            updatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        invoice: {
            id: string;
            invoiceNumber: string;
            orderId: string;
            customerId: string;
            subtotal: number;
            taxAmount: number;
            discountAmount: number;
            total: number;
            status: string;
            dueDate: Date | null;
            paidAt: Date | null;
            notes: string | null;
            version: number;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        } | null;
        items: ({
            product: {
                id: string;
                sku: string;
                name: string;
                description: string | null;
                categoryId: string | null;
                brandId: string | null;
                supplierId: string | null;
                unitPrice: number;
                costPrice: number;
                taxPercent: number;
                unit: string;
                barcode: string | null;
                isActive: boolean;
                minStockAlertQty: number;
                version: number;
                createdBy: string | null;
                updatedBy: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            discount: number;
            tax: number;
            total: number;
        })[];
    } & {
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        total: number;
        notes: string | null;
        shippingAddress: string | null;
        createdById: string;
        expectedAt: Date | null;
        deliveredAt: Date | null;
        version: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create: (data: any) => import(".prisma/client").Prisma.Prisma__OrderClient<{
        customer: {
            id: string;
            name: string;
            email: string | null;
            phone: string | null;
            address: string | null;
            city: string | null;
            country: string | null;
            taxId: string | null;
            status: string;
            assignedToId: string | null;
            totalRevenue: number;
            version: number;
            createdBy: string | null;
            updatedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        items: ({
            product: {
                id: string;
                sku: string;
                name: string;
                description: string | null;
                categoryId: string | null;
                brandId: string | null;
                supplierId: string | null;
                unitPrice: number;
                costPrice: number;
                taxPercent: number;
                unit: string;
                barcode: string | null;
                isActive: boolean;
                minStockAlertQty: number;
                version: number;
                createdBy: string | null;
                updatedBy: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            };
        } & {
            id: string;
            orderId: string;
            productId: string;
            quantity: number;
            unitPrice: number;
            discount: number;
            tax: number;
            total: number;
        })[];
    } & {
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        total: number;
        notes: string | null;
        shippingAddress: string | null;
        createdById: string;
        expectedAt: Date | null;
        deliveredAt: Date | null;
        version: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateStatus: (id: string, status: any) => import(".prisma/client").Prisma.Prisma__OrderClient<{
        id: string;
        orderNumber: string;
        customerId: string;
        status: string;
        subtotal: number;
        taxAmount: number;
        discountAmount: number;
        total: number;
        notes: string | null;
        shippingAddress: string | null;
        createdById: string;
        expectedAt: Date | null;
        deliveredAt: Date | null;
        version: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
};
//# sourceMappingURL=coreRepositories.d.ts.map