import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// JWT 토큰 검증 미들웨어
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '액세스 토큰이 필요합니다.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  });
};

// QR 세션 토큰 검증 미들웨어
export const authenticateQRSession = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'QR 세션 토큰이 필요합니다.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않은 QR 세션입니다.' });
    }

    if (decoded.type !== 'qr_session') {
      return res.status(403).json({ error: 'QR 세션 토큰이 아닙니다.' });
    }

    req.qrSession = decoded;
    next();
  });
};

// 관리자 권한 확인 미들웨어
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  next();
};

// TypeScript 타입 확장
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
