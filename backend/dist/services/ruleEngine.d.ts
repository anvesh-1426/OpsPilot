export declare const ruleEngine: {
    /**
     * Business Rule 1: Check Customer Credit Limit before Order Confirmation
     */
    evaluateCreditLimit: (customerId: string, orderTotal: number) => Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    /**
     * Business Rule 2: Low Stock Trigger & Replenishment Alert
     */
    evaluateLowStockReplenishment: (productId: string, currentQty: number) => Promise<boolean>;
    /**
     * Business Rule 3: Warehouse Capacity Warning
     */
    evaluateWarehouseCapacity: (warehouseId: string) => Promise<{
        percentUsed: number;
        warning: boolean;
    }>;
};
//# sourceMappingURL=ruleEngine.d.ts.map