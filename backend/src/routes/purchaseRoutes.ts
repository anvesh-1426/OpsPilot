import { Router } from 'express';
import { purchaseService, supplierService } from '../services/businessServices';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Suppliers
router.get('/suppliers', async (_req, res, next) => {
  try {
    const data = await supplierService.getSuppliers();
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

router.post('/suppliers', async (req, res, next) => {
  try {
    const data = await supplierService.createSupplier(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) { return next(err); }
});

router.get('/suppliers/:id', async (req, res, next) => {
  try {
    const data = await supplierService.getSupplier(req.params.id as string);
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

router.put('/suppliers/:id', async (req, res, next) => {
  try {
    const data = await supplierService.updateSupplier(req.params.id as string, req.body);
    return res.json({ success: true, data });
  } catch (err) { return next(err); }
});

// Purchase Orders
router.get('/purchase-orders', async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const result = await purchaseService.getPurchaseOrders(page, limit);
    return res.json({ success: true, data: result.orders, meta: { page, limit, total: result.total, pages: result.pages } });
  } catch (err) { return next(err); }
});

router.post('/purchase-orders', async (req, res, next) => {
  try {
    const data = await purchaseService.createPurchaseOrder(req.body);
    return res.status(201).json({ success: true, data });
  } catch (err) { return next(err); }
});

router.post('/purchase-orders/:id/receive', async (req: any, res, next) => {
  try {
    const grn = await purchaseService.receiveGoods(req.params.id as string, req.user!.id, req.body.notes);
    return res.json({ success: true, data: grn });
  } catch (err) { return next(err); }
});

export default router;
