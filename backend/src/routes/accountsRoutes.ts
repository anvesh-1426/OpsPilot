import { Router } from 'express';
import * as accounts from '../controllers/accountsController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/expenses', accounts.getExpenses);
router.post('/expenses', accounts.createExpense);
router.put('/expenses/:id', accounts.updateExpense);
router.delete('/expenses/:id', accounts.deleteExpense);

router.get('/transactions', accounts.getTransactions);
router.get('/pl-summary', accounts.getPLSummary);

export default router;
