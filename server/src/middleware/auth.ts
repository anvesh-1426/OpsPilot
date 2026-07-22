import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";

// Middleware to verify if a request contains a valid JWT Token
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // We expect headers to be in the format: "Authorization: Bearer <TOKEN>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Access denied. No token provided." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
    };

    // Attach decoded user info to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};

// Middleware builder to restrict access to specific roles (Authorization)
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized. Authentication required." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(
          ", "
        )}`,
      });
      return;
    }

    next();
  };
};
