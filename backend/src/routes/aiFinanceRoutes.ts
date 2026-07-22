import { Router } from 'express';
import { aiService } from '../services/aiService';
import { financeService } from '../services/financeService';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// AI Forecasts & Insights
router.get('/ai/sales-forecast', async (_req, res, next) => {
  try {
    const data = await aiService.getSalesForecast();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

router.get('/ai/low-stock-predictions', async (_req, res, next) => {
  try {
    const data = await aiService.getLowStockPredictions();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

router.get('/ai/customer-insights', async (_req, res, next) => {
  try {
    const data = await aiService.getCustomerInsights();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

router.get('/ai/executive-summary', async (_req, res, next) => {
  try {
    const data = await aiService.generateExecutiveSummary();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

// Financial Suite
router.get('/finance/dashboard', async (_req, res, next) => {
  try {
    const data = await financeService.getFinancialDashboard();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

export default router;
