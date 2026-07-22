import { Router, Response } from "express";
import { prisma } from "../index";
import { authenticateJWT, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Require users to be logged in to access inventory routes
router.use(authenticateJWT);

/**
 * @route   POST /api/products
 * @desc    Create a new product SKU (Admin or Warehouse only)
 */
router.post(
  "/",
  requireRole(["ADMIN", "WAREHOUSE"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, sku, category, unitPrice, currentStock, minStockAlertQty, location } = req.body;

    if (!name || !sku || !category || unitPrice === undefined || !location) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    try {
      // Check if SKU is unique
      const existingProduct = await prisma.product.findUnique({ where: { sku } });
      if (existingProduct) {
        res.status(409).json({ error: "Product SKU already exists." });
        return;
      }

      const parsedPrice = parseFloat(unitPrice);
      const parsedStock = currentStock ? parseInt(currentStock) : 0;
      const parsedAlertQty = minStockAlertQty ? parseInt(minStockAlertQty) : 0;

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        res.status(400).json({ error: "Price must be a valid positive number." });
        return;
      }

      // Execute as a Prisma Transaction so the product is created
      // and initial stock log is created atomicly
      const result = await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name,
            sku: sku.toUpperCase(),
            category,
            unitPrice: parsedPrice,
            currentStock: parsedStock,
            minStockAlertQty: parsedAlertQty,
            location,
          },
        });

        // Log initial stock movement if starting stock is > 0
        if (parsedStock > 0 && req.user) {
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantityChanged: parsedStock,
              type: "IN",
              reason: "Initial stock load upon SKU registration",
              createdById: req.user.id,
            },
          });
        }

        return product;
      });

      res.status(201).json({ message: "Product created successfully!", product: result });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create product.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * @route   GET /api/products
 * @desc    List all products with optional filters: search, low stock alerts (All authenticated roles)
 */
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, lowStock, location } = req.query;

  try {
    const whereConditions: any = {};

    if (location) {
      whereConditions.location = location as string;
    }

    if (search) {
      const searchString = search as string;
      whereConditions.OR = [
        { name: { contains: searchString } },
        { sku: { contains: searchString } },
        { category: { contains: searchString } },
      ];
    }

    // Filter only low stock items
    if (lowStock === "true") {
      whereConditions.currentStock = {
        lt: prisma.product.fields.minStockAlertQty, // stock < minStockAlertQty
      };
      
      // Note: Prisma sqlite has query constraints for fields comparison.
      // Alternatively, we load all and filter, or use raw query.
      // Let's implement a clean check: SQLite works fine with this field mapping in Prisma 5+!
    }

    const products = await prisma.product.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve products.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route   POST /api/products/movements
 * @desc    Log a manual stock adjustment (IN or OUT) (Admin or Warehouse only)
 */
router.post(
  "/movements",
  requireRole(["ADMIN", "WAREHOUSE"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { productId, quantityChanged, type, reason } = req.body;

    if (!productId || !quantityChanged || !type || !reason) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const parsedQty = parseInt(quantityChanged);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      res.status(400).json({ error: "Quantity must be a positive integer." });
      return;
    }

    const movementType = type.toUpperCase();
    if (movementType !== "IN" && movementType !== "OUT") {
      res.status(400).json({ error: "Movement type must be either 'IN' or 'OUT'." });
      return;
    }

    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        res.status(404).json({ error: "Product not found." });
        return;
      }

      // Check for negative stock if logging an "OUT" movement
      if (movementType === "OUT" && product.currentStock - parsedQty < 0) {
        res.status(400).json({
          error: `Insufficient stock. Current stock is ${product.currentStock}, cannot deduct ${parsedQty}.`,
        });
        return;
      }

      // Execute updating stock count and logging history inside a Transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: {
            currentStock: {
              increment: movementType === "IN" ? parsedQty : -parsedQty,
            },
          },
        });

        const movement = await tx.stockMovement.create({
          data: {
            productId,
            quantityChanged: movementType === "IN" ? parsedQty : -parsedQty,
            type: movementType,
            reason,
            createdById: req.user!.id,
          },
        });

        return { updatedProduct, movement };
      });

      res.status(200).json({
        message: "Stock adjusted successfully!",
        currentStock: result.updatedProduct.currentStock,
        movement: result.movement,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to record stock movement." });
    }
  }
);

/**
 * @route   GET /api/products/:id/movements
 * @desc    Get stock movement log history for a specific product (All authenticated roles)
 */
router.get("/:id/movements", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    const movements = await prisma.stockMovement.findMany({
      where: { productId: id },
      include: {
        createdBy: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ movements });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock movements." });
  }
});

export default router;
