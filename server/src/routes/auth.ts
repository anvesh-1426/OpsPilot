import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { authenticateJWT, requireRole } from "../middleware/auth";
import { AuthenticatedRequest } from "../types";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";

/**
 * @route   POST /api/auth/register
 * @desc    Registers a new user. 
 *          Bootstrap security: If no users exist, anyone can register the first user (usually Admin).
 *          If users exist, only logged-in ADMINs can register new employees.
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, role } = req.body;

  // Simple input validation
  if (!email || !password || !name || !role) {
    res.status(400).json({ error: "Please provide email, password, name, and role." });
    return;
  }

  // Validate that the role is one of the allowed values
  const validRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"];
  if (!validRoles.includes(role.toUpperCase())) {
    res.status(400).json({ error: `Invalid role. Allowed roles are: ${validRoles.join(", ")}` });
    return;
  }

  try {
    // Check if any user already exists in the database
    const userCount = await prisma.user.count();

    // If users already exist, we require Admin authentication
    if (userCount > 0) {
      // We manually execute JWT authentication for this endpoint to allow bootstrapping
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Access denied. Admin authorization token required." });
        return;
      }

      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
        if (decoded.role !== "ADMIN") {
          res.status(403).json({ error: "Access forbidden. Only Admin accounts can create users." });
          return;
        }
      } catch (err) {
        res.status(403).json({ error: "Invalid admin token." });
        return;
      }
    }

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "Email is already in use." });
      return;
    }

    // Hash the password using bcrypt with a salt round of 10
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role.toUpperCase(),
      },
    });

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to register user.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticates a user and returns a JWT
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please provide both email and password." });
    return;
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    // Generate JWT (expires in 24 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to authenticate.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Gets the profile of the currently logged-in user
 */
router.get("/me", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details." });
  }
});

export default router;
