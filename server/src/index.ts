import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRouter from "./routes/auth";
import customerRouter from "./routes/customers";
import productRouter from "./routes/products";
import challanRouter from "./routes/challans";

// Load environment variables from our .env file
dotenv.config();

// Initialize Express application
const app = express();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Configure Middleware
app.use(cors());
app.use(express.json());

// Register API Routes
app.use("/api/auth", authRouter);
app.use("/api/customers", customerRouter);
app.use("/api/products", productRouter);
app.use("/api/challans", challanRouter);

// A simple Health Check Route
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "success",
      message: "Server is healthy and database is connected!",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server is running, but database is unreachable.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start listening for connections
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
