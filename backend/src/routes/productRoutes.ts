import { Router } from 'express';
import * as products from '../controllers/productsController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Products
router.get('/products', products.getProducts);
router.post('/products', products.createProduct);
router.get('/products/:id', products.getProduct);
router.put('/products/:id', products.updateProduct);
router.delete('/products/:id', products.deleteProduct);
router.post('/products/:id/adjust-stock', products.adjustStock);

// Categories
router.get('/categories', products.getCategories);
router.post('/categories', products.createCategory);

// Suppliers
router.get('/suppliers', products.getSuppliers);
router.post('/suppliers', products.createSupplier);
router.put('/suppliers/:id', products.updateSupplier);

export default router;
