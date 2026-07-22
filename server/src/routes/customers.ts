import { Router, Response } from "express";
import { prisma } from "../index";
import { authenticateJWT, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Apply authenticateJWT middleware globally to all customer routes
router.use(authenticateJWT);

/**
 * @route   POST /api/customers
 * @desc    Create a new customer (Admin or Sales only)
 */
router.post(
  "/",
  requireRole(["ADMIN", "SALES"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      type,
      address,
      status,
      followUpDate,
    } = req.body;

    // Validation
    if (!name || !mobile || !email || !businessName || !type || !address) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    // Validate type values
    const allowedTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
    if (!allowedTypes.includes(type.toUpperCase())) {
      res.status(400).json({ error: `Invalid type. Allowed: ${allowedTypes.join(", ")}` });
      return;
    }

    // Validate status if provided
    const allowedStatuses = ["LEAD", "ACTIVE", "INACTIVE"];
    if (status && !allowedStatuses.includes(status.toUpperCase())) {
      res.status(400).json({ error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
      return;
    }

    try {
      const customer = await prisma.customer.create({
        data: {
          name,
          mobile,
          email,
          businessName,
          gstNumber,
          type: type.toUpperCase(),
          address,
          status: status ? status.toUpperCase() : "LEAD",
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });

      res.status(201).json({ message: "Customer created successfully!", customer });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create customer.",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * @route   GET /api/customers
 * @desc    Get all customers with optional search filtering (All authenticated roles)
 */
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { search, status, type } = req.query;

  try {
    // Build dynamic filtering conditions
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = (status as string).toUpperCase();
    }
    if (type) {
      whereConditions.type = (type as string).toUpperCase();
    }
    if (search) {
      const searchString = search as string;
      whereConditions.OR = [
        { name: { contains: searchString } },
        { businessName: { contains: searchString } },
        { email: { contains: searchString } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve customers." });
  }
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get details of a single customer, including follow-up notes (All authenticated roles)
 */
router.get("/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found." });
      return;
    }

    res.status(200).json({ customer });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve customer details." });
  }
});

/**
 * @route   PATCH /api/customers/:id
 * @desc    Update customer details (Admin or Sales only)
 */
router.patch(
  "/:id",
  requireRole(["ADMIN", "SALES"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const {
      name,
      mobile,
      email,
      businessName,
      gstNumber,
      type,
      address,
      status,
      followUpDate,
    } = req.body;

    try {
      // Verify customer exists
      const existingCustomer = await prisma.customer.findUnique({ where: { id } });
      if (!existingCustomer) {
        res.status(404).json({ error: "Customer not found." });
        return;
      }

      // Check fields and build update payload
      const updateData: any = {};
      if (name) updateData.name = name;
      if (mobile) updateData.mobile = mobile;
      if (email) updateData.email = email;
      if (businessName) updateData.businessName = businessName;
      if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
      if (address) updateData.address = address;

      if (type) {
        const allowedTypes = ["RETAIL", "WHOLESALE", "DISTRIBUTOR"];
        if (!allowedTypes.includes(type.toUpperCase())) {
          res.status(400).json({ error: "Invalid customer type." });
          return;
        }
        updateData.type = type.toUpperCase();
      }

      if (status) {
        const allowedStatuses = ["LEAD", "ACTIVE", "INACTIVE"];
        if (!allowedStatuses.includes(status.toUpperCase())) {
          res.status(400).json({ error: "Invalid customer status." });
          return;
        }
        updateData.status = status.toUpperCase();
      }

      if (followUpDate !== undefined) {
        updateData.followUpDate = followUpDate ? new Date(followUpDate) : null;
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        message: "Customer updated successfully!",
        customer: updatedCustomer,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update customer." });
    }
  }
);

/**
 * @route   POST /api/customers/:id/notes
 * @desc    Add a follow-up note to a customer file (Admin or Sales only)
 */
router.post(
  "/:id/notes",
  requireRole(["ADMIN", "SALES"]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ error: "Note content cannot be empty." });
      return;
    }

    try {
      // Verify customer exists
      const customer = await prisma.customer.findUnique({ where: { id } });
      if (!customer) {
        res.status(404).json({ error: "Customer not found." });
        return;
      }

      const note = await prisma.followUpNote.create({
        data: {
          customerId: id,
          content,
        },
      });

      res.status(201).json({ message: "Follow-up note added!", note });
    } catch (error) {
      res.status(500).json({ error: "Failed to add note." });
    }
  }
);

export default router;
