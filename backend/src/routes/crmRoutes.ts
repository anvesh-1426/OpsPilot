import { Router } from 'express';
import * as crm from '../controllers/crmController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Customers
router.get('/customers', crm.getCustomers);
router.post('/customers', crm.createCustomer);
router.get('/customers/:id', crm.getCustomer);
router.put('/customers/:id', crm.updateCustomer);
router.delete('/customers/:id', crm.deleteCustomer);
router.post('/customers/:id/interactions', crm.addInteraction);
router.post('/customers/:id/notes', crm.addNote);

// Leads
router.get('/leads', crm.getLeads);
router.post('/leads', crm.createLead);
router.put('/leads/:id', crm.updateLead);
router.delete('/leads/:id', crm.deleteLead);

export default router;
