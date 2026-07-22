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
export declare const sendResponse: <T>(res: Response, statusCode: number, success: boolean, message: string, data?: T, pagination?: ApiResponse['pagination'], meta?: Record<string, any>, errors?: any) => Response<any, Record<string, any>>;
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number, pagination?: ApiResponse['pagination'], meta?: Record<string, any>) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: any) => Response<any, Record<string, any>>;
//# sourceMappingURL=responseFormatter.d.ts.map