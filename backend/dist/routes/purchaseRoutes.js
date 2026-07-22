"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const businessServices_1 = require("../services/businessServices");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Suppliers
router.get('/suppliers', async (_req, res, next) => {
    try {
        const data = await businessServices_1.supplierService.getSuppliers();
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/suppliers', async (req, res, next) => {
    try {
        const data = await businessServices_1.supplierService.createSupplier(req.body);
        return res.status(201).json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.get('/suppliers/:id', async (req, res, next) => {
    try {
        const data = await businessServices_1.supplierService.getSupplier(req.params.id);
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.put('/suppliers/:id', async (req, res, next) => {
    try {
        const data = await businessServices_1.supplierService.updateSupplier(req.params.id, req.body);
        return res.json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
// Purchase Orders
router.get('/purchase-orders', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const result = await businessServices_1.purchaseService.getPurchaseOrders(page, limit);
        return res.json({ success: true, data: result.orders, meta: { page, limit, total: result.total, pages: result.pages } });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/purchase-orders', async (req, res, next) => {
    try {
        const data = await businessServices_1.purchaseService.createPurchaseOrder(req.body);
        return res.status(201).json({ success: true, data });
    }
    catch (err) {
        return next(err);
    }
});
router.post('/purchase-orders/:id/receive', async (req, res, next) => {
    try {
        const grn = await businessServices_1.purchaseService.receiveGoods(req.params.id, req.user.id, req.body.notes);
        return res.json({ success: true, data: grn });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
//# sourceMappingURL=purchaseRoutes.js.map