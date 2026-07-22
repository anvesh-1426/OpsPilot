"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflowEngine_1 = require("../services/workflowEngine");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Approve & process sales order auto-workflow
router.post('/orders/:id/approve-workflow', async (req, res, next) => {
    try {
        const result = await workflowEngine_1.workflowEngine.processOrderApproval(req.params.id, req.user.id);
        return res.json({ success: true, message: 'Order approved & automated workflow executed successfully', data: result });
    }
    catch (err) {
        return next(err);
    }
});
// Transition purchase order workflow
router.post('/purchase-orders/:id/transition', async (req, res, next) => {
    try {
        const result = await workflowEngine_1.workflowEngine.processPurchaseWorkflow(req.params.id, req.body.status, req.user.id);
        return res.json({ success: true, data: result });
    }
    catch (err) {
        return next(err);
    }
});
exports.default = router;
//# sourceMappingURL=workflowRoutes.js.map