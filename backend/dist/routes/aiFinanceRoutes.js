"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiService_1 = require("../services/aiService");
const financeService_1 = require("../services/financeService");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// AI Forecasts & Insights
router.get('/ai/sales-forecast', async (_req, res, next) => {
    try {
        const data = await aiService_1.aiService.getSalesForecast();
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.get('/ai/low-stock-predictions', async (_req, res, next) => {
    try {
        const data = await aiService_1.aiService.getLowStockPredictions();
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.get('/ai/customer-insights', async (_req, res, next) => {
    try {
        const data = await aiService_1.aiService.getCustomerInsights();
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.get('/ai/executive-summary', async (_req, res, next) => {
    try {
        const data = await aiService_1.aiService.generateExecutiveSummary();
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
// Financial Suite
router.get('/finance/dashboard', async (_req, res, next) => {
    try {
        const data = await financeService_1.financeService.getFinancialDashboard();
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
//# sourceMappingURL=aiFinanceRoutes.js.map