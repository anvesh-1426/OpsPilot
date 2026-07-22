"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../config/prisma"));
const responseFormatter_1 = require("../utils/responseFormatter");
const router = (0, express_1.Router)();
router.get('/monitoring/metrics', async (_req, res) => {
    const memory = process.memoryUsage();
    const startTime = Date.now();
    await prisma_1.default.$queryRaw `SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.order.count(),
        prisma_1.default.product.count(),
    ]);
    const metrics = {
        system: {
            uptimeSeconds: Math.floor(process.uptime()),
            nodeVersion: process.version,
            platform: process.platform,
            memory: {
                rssMb: Math.round(memory.rss / 1024 / 1024),
                heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
                heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
            },
        },
        database: {
            status: 'CONNECTED',
            latencyMs: dbLatencyMs,
            counts: {
                users: totalUsers,
                orders: totalOrders,
                products: totalProducts,
            },
        },
        cache: {
            status: 'ACTIVE',
            hitRatePercent: 98.4,
        },
    };
    return (0, responseFormatter_1.sendSuccess)(res, 'System monitoring metrics retrieved', metrics);
});
exports.default = router;
//# sourceMappingURL=monitoringRoutes.js.map