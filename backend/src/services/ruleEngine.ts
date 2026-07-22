import prisma from '../config/prisma';
import { logger } from '../config/logger';

export const ruleEngine = {
  /**
   * Business Rule 1: Check Customer Credit Limit before Order Confirmation
   */
  evaluateCreditLimit: async (customerId: string, orderTotal: number): Promise<{ allowed: boolean; reason?: string }> => {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { allowed: false, reason: 'Customer not found' };

    const maxCreditLimit = 100_000; // $100k enterprise credit limit
    if (customer.totalRevenue + orderTotal > maxCreditLimit) {
      logger.warn(`⚠️ [RuleEngine] Credit limit exceeded for customer ${customer.name}`);
      return { allowed: true, reason: 'Warning: High credit utilization' };
    }

    return { allowed: true };
  },

  /**
   * Business Rule 2: Low Stock Trigger & Replenishment Alert
   */
  evaluateLowStockReplenishment: async (productId: string, currentQty: number): Promise<boolean> => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return false;

    if (currentQty <= product.minStockAlertQty) {
      logger.warn(`⚠️ [RuleEngine] Product ${product.sku} (${product.name}) reached low stock threshold (${currentQty}/${product.minStockAlertQty})`);
      return true;
    }

    return false;
  },

  /**
   * Business Rule 3: Warehouse Capacity Warning
   */
  evaluateWarehouseCapacity: async (warehouseId: string): Promise<{ percentUsed: number; warning: boolean }> => {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId }, include: { inventory: true } });
    if (!warehouse || !warehouse.capacity) return { percentUsed: 0, warning: false };

    const totalStock = warehouse.inventory.reduce((sum, inv) => sum + inv.quantity, 0);
    const percentUsed = (totalStock / warehouse.capacity) * 100;
    const warning = percentUsed >= 90;

    if (warning) {
      logger.warn(`⚠️ [RuleEngine] Warehouse ${warehouse.name} capacity utilization at ${percentUsed.toFixed(1)}%`);
    }

    return { percentUsed, warning };
  },
};
