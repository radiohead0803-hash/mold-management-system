import { Request, Response, NextFunction } from 'express';
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticateQRSession: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                username: string;
                role: string;
            };
            qrSession?: {
                moldId: number;
                type: string;
            };
        }
    }
}
//# sourceMappingURL=auth.d.ts.map