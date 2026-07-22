import { Router } from 'express';
import { workflowEngine } from '../services/workflowEngine';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Approve & process sales order auto-workflow
router.post('/orders/:id/approve-workflow', async (req: any, res, next) => {
  try {
    const result = await workflowEngine.processOrderApproval(req.params.id as string, req.user!.id);
    return res.json({ success: true, message: 'Order approved & automated workflow executed successfully', data: result });
  } catch (err) { return next(err); }
});

// Transition purchase order workflow
router.post('/purchase-orders/:id/transition', async (req: any, res, next) => {
  try {
    const result = await workflowEngine.processPurchaseWorkflow(req.params.id as string, req.body.status, req.user!.id);
    return res.json({ success: true, data: result });
  } catch (err) { return next(err); }
});

export default router;
