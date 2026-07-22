"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dash = __importStar(require("../controllers/dashboardController"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
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
router.get('/users', (0, auth_1.authorize)('ADMIN'), dash.getUsers);
router.post('/users', (0, auth_1.authorize)('ADMIN'), dash.createUser);
router.put('/users/:id', (0, auth_1.authorize)('ADMIN'), dash.updateUser);
router.get('/audit-logs', (0, auth_1.authorize)('ADMIN'), dash.getAuditLogs);
// Settings
router.get('/settings', dash.getSettings);
router.put('/settings', (0, auth_1.authorize)('ADMIN'), dash.updateSettings);
// Reports
router.get('/reports/sales', dash.getSalesReport);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map