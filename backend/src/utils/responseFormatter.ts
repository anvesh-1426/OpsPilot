import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: Record<string, any>;
  errors?: any;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  pagination?: ApiResponse['pagination'],
  meta?: Record<string, any>,
  errors?: any
) => {
  const response: ApiResponse<T> = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
    ...(meta && { meta }),
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  pagination?: ApiResponse['pagination'],
  meta?: Record<string, any>
) => {
  return sendResponse(res, statusCode, true, message, data, pagination, meta);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: any
) => {
  return sendResponse(res, statusCode, false, message, undefined, undefined, undefined, errors);
};
