import { Router } from 'express';
import * as sales from '../controllers/salesController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Orders
router.get('/orders', sales.getOrders);
router.post('/orders', sales.createOrder);
router.get('/orders/:id', sales.getOrder);
router.put('/orders/:id/status', sales.updateOrderStatus);

// Invoices
router.get('/invoices', sales.getInvoices);
router.post('/invoices', sales.createInvoice);
router.post('/invoices/:id/payments', sales.addPayment);

// Quotations
router.get('/quotations', sales.getQuotations);
router.post('/quotations', sales.createQuotation);

// Delivery Challans
router.get('/challans', sales.getChallans);
router.post('/challans', sales.createChallan);
router.patch('/challans/:id/status', sales.updateChallanStatus);

export default router;
