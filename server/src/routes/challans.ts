import { Router, Response } from "express";
import { prisma } from "../index";
import { authenticateJWT, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Require users to be logged in to manage orders
router.use(authenticateJWT);

// Helper function to generate a unique Challan number
// Format: CH-YYYYMMDD-XXXX (where XXXX is a random 4-digit number)
function generateChallanNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  return `CH-${dateStr}-${randomStr}`;
}

/**
 * @route   POST /api/challans
 * @desc    Create a new sales challan (Draft or Confirmed) (Admin or Sales only)
 */
router.post(
  "/",
  requireRole(["ADMIN", "SALES"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { customerId, status, items } = req.body; // items = [{ productId: "...", quantity: 5 }]

    // Validation
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Missing customer ID or items list." });
      return;
    }

    const challanStatus = status ? status.toUpperCase() : "DRAFT";
    if (challanStatus !== "DRAFT" && challanStatus !== "CONFIRMED") {
      res.status(400).json({ error: "Challan status must be either 'DRAFT' or 'CONFIRMED'." });
      return;
    }

    try {
      // 1. Verify customer exists
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        res.status(404).json({ error: "Customer not found." });
        return;
      }

      // 2. Fetch all products in the order payload to verify stock and price
      const productIds = items.map((item) => item.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (dbProducts.length !== productIds.length) {
        res.status(400).json({ error: "One or more product IDs are invalid." });
        return;
      }

      // Map DB products by ID for fast lookup
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // 3. Perform stock checks if the order status is "CONFIRMED"
      if (challanStatus === "CONFIRMED") {
        for (const item of items) {
          const product = productMap.get(item.productId);
          if (!product) continue;
          
          const qty = parseInt(item.quantity);
          if (isNaN(qty) || qty <= 0) {
            res.status(400).json({ error: `Invalid quantity for product ${product.name}.` });
            return;
          }

          if (product.currentStock - qty < 0) {
            res.status(400).json({
              error: `Insufficient stock for product ${product.name} (SKU: ${product.sku}). Current stock is ${product.currentStock}, requested ${qty}.`,
            });
            return;
          }
        }
      }

      // 4. Generate Challan Number
      const challanNumber = generateChallanNumber();
      let totalQty = 0;

      // 5. Run atomic Prisma transaction to save challan, items, and adjust stock (if confirmed)
      const newChallan = await prisma.$transaction(async (tx) => {
        // Build items data array with pricing snapshots
        const itemsToCreate = items.map((item) => {
          const product = productMap.get(item.productId)!;
          const qty = parseInt(item.quantity);
          totalQty += qty;

          return {
            productId: item.productId,
            quantity: qty,
            unitPriceSnapshot: product.unitPrice,
          };
        });

        // Create the Challan record
        const challan = await tx.salesChallan.create({
          data: {
            challanNumber,
            customerId,
            totalQuantity: totalQty,
            status: challanStatus,
            createdById: req.user!.id,
            items: {
              create: itemsToCreate,
            },
          },
          include: {
            items: true,
          },
        });

        // Deduct inventory and log stock movements only if Confirmed
        if (challanStatus === "CONFIRMED") {
          for (const item of items) {
            const qty = parseInt(item.quantity);

            // Deduct stock count
            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  decrement: qty,
                },
              },
            });

            // Log stock movement history
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                quantityChanged: -qty,
                type: "OUT",
                reason: `Sales Challan ${challanNumber} Confirmation`,
                createdById: req.user!.id,
              },
            });
          }
        }

        return challan;
      });

      res.status(201).json({
        message: `Sales Challan created successfully in ${challanStatus} status!`,
        challan: newChallan,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create sales challan.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * @route   GET /api/challans
 * @desc    Get all sales challans (All authenticated roles)
 */
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { customerId, status } = req.query;

  try {
    const whereConditions: any = {};
    if (customerId) whereConditions.customerId = customerId as string;
    if (status) whereConditions.status = (status as string).toUpperCase();

    const challans = await prisma.salesChallan.findMany({
      where: whereConditions,
      include: {
        customer: {
          select: { name: true, businessName: true },
        },
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ challans });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales challans." });
  }
});

/**
 * @route   GET /api/challans/:id
 * @desc    Get details of a single sales challan including items (All authenticated roles)
 */
router.get("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { name: true, role: true },
        },
        items: {
          include: {
            product: {
              select: { name: true, sku: true, category: true },
            },
          },
        },
      },
    });

    if (!challan) {
      res.status(404).json({ error: "Challan not found." });
      return;
    }

    res.status(200).json({ challan });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve challan details." });
  }
});

/**
 * @route   POST /api/challans/:id/confirm
 * @desc    Confirm a draft challan (Triggers stock validation and reduction) (Admin or Sales only)
 */
router.post(
  "/:id/confirm",
  requireRole(["ADMIN", "SALES"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      // 1. Fetch the Challan
      const challan = await prisma.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        res.status(404).json({ error: "Sales challan not found." });
        return;
      }

      if (challan.status === "CONFIRMED") {
        res.status(400).json({ error: "Challan has already been confirmed." });
        return;
      }

      if (challan.status === "CANCELLED") {
        res.status(400).json({ error: "Cancelled challans cannot be confirmed." });
        return;
      }

      // 2. Fetch all products inside the challan to check stock
      const productIds = challan.items.map((item) => item.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // 3. Verify stock is sufficient
      for (const item of challan.items) {
        const product = productMap.get(item.productId)!;
        if (product.currentStock - item.quantity < 0) {
          res.status(400).json({
            error: `Insufficient stock for product ${product.name} (SKU: ${product.sku}). Current stock: ${product.currentStock}, required: ${item.quantity}`,
          });
          return;
        }
      }

      // 4. Run Transaction to confirm and deduct stock
      const confirmedChallan = await prisma.$transaction(async (tx) => {
        // Update Challan Status
        const updated = await tx.salesChallan.update({
          where: { id },
          data: { status: "CONFIRMED" },
        });

        // Loop and deduct stock + create movements
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: -item.quantity,
              type: "OUT",
              reason: `Sales Challan ${challan.challanNumber} Confirmation`,
              createdById: req.user!.id,
            },
          });
        }

        return updated;
      });

      res.status(200).json({
        message: "Sales Challan confirmed successfully. Inventory stock has been updated.",
        challan: confirmedChallan,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm sales challan." });
    }
  }
);

export default router;
