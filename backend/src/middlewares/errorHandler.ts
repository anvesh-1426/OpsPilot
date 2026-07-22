import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Prisma errors
  if ((err as any).code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    });
  }
  if ((err as any).code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found.',
    });
  }

  logger.error('Unhandled error:', err);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err.message || 'Internal server error.');
  return res.status(500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export const notFound = (_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
};
