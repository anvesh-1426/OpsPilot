export declare const supplierService: {
    getSuppliers: () => Promise<({
        _count: {
            products: number;
            purchaseOrders: number;
        };
    } & {
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
    })[]>;
    getSupplier: (id: string) => Promise<({
        products: {
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
        }[];
        purchaseOrders: ({
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
                purchaseOrderId: string;
                productId: string;
                quantity: number;
                unitCost: number;
                total: number;
            })[];
        } & {
            id: string;
            poNumber: string;
            supplierId: string;
            warehouseId: string;
            total: number;
            status: string;
            createdAt: Date;
        })[];
    } & {
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
    }) | null>;
    createSupplier: (data: any) => Promise<{
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
    }>;
    updateSupplier: (id: string, data: any) => Promise<{
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
    }>;
    deleteSupplier: (id: string) => Promise<{
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
    }>;
};
export declare const purchaseService: {
    getPurchaseOrders: (page?: number, limit?: number) => Promise<{
        orders: ({
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
                purchaseOrderId: string;
                productId: string;
                quantity: number;
                unitCost: number;
                total: number;
            })[];
            supplier: {
                id: string;
                name: string;
            };
            warehouse: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            poNumber: string;
            supplierId: string;
            warehouseId: string;
            total: number;
            status: string;
            createdAt: Date;
        })[];
        total: number;
        pages: number;
    }>;
    createPurchaseOrder: (data: any) => Promise<{
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
            purchaseOrderId: string;
            productId: string;
            quantity: number;
            unitCost: number;
            total: number;
        })[];
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
        };
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
        poNumber: string;
        supplierId: string;
        warehouseId: string;
        total: number;
        status: string;
        createdAt: Date;
    }>;
    receiveGoods: (poId: string, receivedBy: string, notes?: string) => Promise<{
        id: string;
        grnNumber: string;
        purchaseOrderId: string;
        warehouseId: string;
        receivedAt: Date;
        receivedBy: string;
        notes: string | null;
    }>;
};
export declare const analyticsService: {
    getSalesAnalytics: (timeframe?: string) => Promise<{
        totalRevenue: number;
        totalOrders: number;
        timeframe: string;
    }>;
    getInventoryAnalytics: () => Promise<{
        totalValue: number;
        lowStockCount: number;
        outOfStockCount: number;
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
    }>;
    getCustomerAnalytics: () => Promise<{
        total: number;
        active: number;
        prospects: number;
        topCustomers: {
            id: string;
            name: string;
            status: string;
            totalRevenue: number;
        }[];
    }>;
};
//# sourceMappingURL=businessServices.d.ts.map