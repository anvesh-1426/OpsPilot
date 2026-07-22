import { Router } from 'express';
import * as inv from '../controllers/inventoryController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Inventory
router.get('/', inv.getInventory);
router.get('/summary', inv.getInventorySummary);
router.get('/movements', inv.getStockMovements);

// Warehouses
router.get('/warehouses', inv.getWarehouses);
router.post('/warehouses', inv.createWarehouse);
router.get('/warehouses/:id', inv.getWarehouse);
router.put('/warehouses/:id', inv.updateWarehouse);
router.delete('/warehouses/:id', inv.deleteWarehouse);

// Purchase Orders
router.get('/purchase-orders', inv.getPurchaseOrders);
router.post('/purchase-orders', inv.createPurchaseOrder);

export default router;
