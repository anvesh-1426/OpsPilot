export declare const aiService: {
    /**
     * AI Sales & Revenue Forecast
     */
    getSalesForecast: () => Promise<{
        growthTrend: string;
        forecastPeriod: string;
        projectedTotalRevenue: number;
        dailyForecast: {
            date: string;
            projectedRevenue: number;
            confidence: number;
        }[];
    }>;
    /**
     * AI Low Stock & Inventory Predictions
     */
    getLowStockPredictions: () => Promise<{
        productId: string;
        productName: string;
        sku: string;
        warehouseName: string;
        currentStock: number;
        dailyBurnRate: number;
        daysUntilDepletion: number;
        riskLevel: string;
        suggestedReorderQty: number;
    }[]>;
    /**
     * AI Customer Insights & Churn Risk Detection
     */
    getCustomerInsights: () => Promise<{
        customerId: string;
        name: string;
        email: string | null;
        totalRevenue: number;
        daysSinceLastOrder: number;
        churnRisk: string;
        recommendedAction: string;
    }[]>;
    /**
     * AI Weekly Business Executive Summary Generator
     */
    generateExecutiveSummary: () => Promise<{
        title: string;
        generatedAt: string;
        highlights: string[];
        risks: string[];
        aiRecommendations: string[];
    }>;
};
//# sourceMappingURL=aiService.d.ts.map