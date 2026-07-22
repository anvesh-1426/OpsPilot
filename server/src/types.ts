import { Request } from "express";

// A custom interface extending Express's Request to support req.user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
