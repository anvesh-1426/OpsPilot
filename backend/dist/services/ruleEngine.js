"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleEngine = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = require("../config/logger");
exports.ruleEngine = {
    /**
     * Business Rule 1: Check Customer Credit Limit before Order Confirmation
     */
    evaluateCreditLimit: async (customerId, orderTotal) => {
        const customer = await prisma_1.default.customer.findUnique({ where: { id: customerId } });
        if (!customer)
            return { allowed: false, reason: 'Customer not found' };
        const maxCreditLimit = 100000; // $100k enterprise credit limit
        if (customer.totalRevenue + orderTotal > maxCreditLimit) {
            logger_1.logger.warn(`⚠️ [RuleEngine] Credit limit exceeded for customer ${customer.name}`);
            return { allowed: true, reason: 'Warning: High credit utilization' };
        }
        return { allowed: true };
    },
    /**
     * Business Rule 2: Low Stock Trigger & Replenishment Alert
     */
    evaluateLowStockReplenishment: async (productId, currentQty) => {
        const product = await prisma_1.default.product.findUnique({ where: { id: productId } });
        if (!product)
            return false;
        if (currentQty <= product.minStockAlertQty) {
            logger_1.logger.warn(`⚠️ [RuleEngine] Product ${product.sku} (${product.name}) reached low stock threshold (${currentQty}/${product.minStockAlertQty})`);
            return true;
        }
        return false;
    },
    /**
     * Business Rule 3: Warehouse Capacity Warning
     */
    evaluateWarehouseCapacity: async (warehouseId) => {
        const warehouse = await prisma_1.default.warehouse.findUnique({ where: { id: warehouseId }, include: { inventory: true } });
        if (!warehouse || !warehouse.capacity)
            return { percentUsed: 0, warning: false };
        const totalStock = warehouse.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
        const percentUsed = (totalStock / warehouse.capacity) * 100;
        const warning = percentUsed >= 90;
        if (warning) {
            logger_1.logger.warn(`⚠️ [RuleEngine] Warehouse ${warehouse.name} capacity utilization at ${percentUsed.toFixed(1)}%`);
        }
        return { percentUsed, warning };
    },
};
//# sourceMappingURL=ruleEngine.js.map