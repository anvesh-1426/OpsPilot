import { Router } from 'express';
import * as dash from '../controllers/dashboardController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

// Dashboard
router.get('/stats', dash.getDashboardStats);
router.get('/revenue-chart', dash.getRevenueChart);
router.get('/recent-activity', dash.getRecentActivity);

// Search
router.get('/search', dash.globalSearch);

// Notifications
router.get('/notifications', dash.getNotifications);
router.put('/notifications/:id/read', dash.markNotificationRead);

// Admin
router.get('/users', authorize('ADMIN'), dash.getUsers);
router.post('/users', authorize('ADMIN'), dash.createUser);
router.put('/users/:id', authorize('ADMIN'), dash.updateUser);
router.get('/audit-logs', authorize('ADMIN'), dash.getAuditLogs);

// Settings
router.get('/settings', dash.getSettings);
router.put('/settings', authorize('ADMIN'), dash.updateSettings);

// Reports
router.get('/reports/sales', dash.getSalesReport);

export default router;
