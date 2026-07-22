export declare const financeService: {
    /**
     * Complete Financial Suite — Balance Sheet, Cash Flow, AR/AP, Tax Summary
     */
    getFinancialDashboard: () => Promise<{
        cashInflow: number;
        cashOutflow: number;
        netCashFlow: number;
        accountsReceivable: number;
        accountsPayable: number;
        inventoryValuation: number;
        balanceSheet: {
            assets: {
                currentAssets: {
                    cashAndEquivalents: number;
                    accountsReceivable: number;
                    inventoryValuation: number;
                    totalCurrentAssets: number;
                };
                fixedAssets: {
                    equipmentAndProperty: number;
                    totalFixedAssets: number;
                };
                totalAssets: number;
            };
            liabilities: {
                accountsPayable: number;
                shortTermLoans: number;
                totalLiabilities: number;
            };
            equity: {
                retainedEarnings: number;
                capitalStock: number;
                totalEquity: number;
            };
        };
        cashFlow: {
            operatingInflow: number;
            operatingOutflow: number;
            netOperatingCashFlow: number;
            investingCashFlow: number;
            financingCashFlow: number;
            totalNetCashFlow: number;
        };
        taxSummary: {
            totalTaxCollected: number;
            totalTaxPaidOnExpenses: number;
            netTaxPayable: number;
            taxRate: string;
        };
    }>;
};
//# sourceMappingURL=financeService.d.ts.map