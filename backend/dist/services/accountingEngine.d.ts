export declare const accountingEngine: {
    /**
     * Automatically record Double-Entry Journal & Ledger Entries for Sales Revenue
     */
    recordSalesRevenue: (orderNumber: string, amount: number) => Promise<void>;
    /**
     * Automatically record Expense Entry
     */
    recordExpense: (title: string, category: string, amount: number) => Promise<void>;
};
//# sourceMappingURL=accountingEngine.d.ts.map