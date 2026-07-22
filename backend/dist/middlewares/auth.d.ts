import { Request, Response, NextFunction } from 'express';
export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS' | string;
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
}
export declare const authenticate: (req: AuthRequest, _res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map