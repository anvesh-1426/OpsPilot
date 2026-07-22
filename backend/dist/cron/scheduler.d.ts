export declare const cronScheduler: {
    /**
     * Daily Inventory Check & Alert Scheduler
     */
    runDailyInventoryCheck: () => Promise<({
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
    })[] | undefined>;
    /**
     * Overdue Invoice Payment Reminder Scheduler
     */
    runInvoiceOverdueReminders: () => Promise<{
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
    }[] | undefined>;
};
//# sourceMappingURL=scheduler.d.ts.map