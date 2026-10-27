import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload, UserRole } from '../types/user';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required. No token provided.' });
    return;
  }

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ success: false, error: 'Invalid or expired session token.' });
      return;
    }
    req.user = decoded as JWTPayload;
    next();
  });
}

export function requireRole(allowedRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    if (req.user.role !== allowedRole && req.user.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: `Access denied. Requires '${allowedRole}' role permission.` 
      });
      return;
    }
    next();
  };
}

export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: `Access denied. Role '${req.user.role}' lacks permission for this action.` 
      });
      return;
    }
    next();
  };
}

