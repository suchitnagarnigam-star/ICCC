import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload, UserRole } from '../types/user';
import { ComplaintRepository } from '../repositories/complaintRepository';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Strict JWT Authentication Middleware
 */
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

/**
 * Optional JWT Authentication Middleware (attaches req.user if valid token provided)
 */
export function optionalAuthenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, ENV.JWT_SECRET, (_err, decoded) => {
    if (decoded) {
      req.user = decoded as JWTPayload;
    }
    next();
  });
}

/**
 * Require specific UserRole
 */
export function requireRole(allowedRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    if (req.user.role !== allowedRole && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires '${allowedRole}' role permission.`,
      });
      return;
    }
    next();
  };
}

/**
 * Require any of the specified UserRoles
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' lacks permission for this action.`,
      });
      return;
    }
    next();
  };
}

/**
 * Territorial & Scope Authorization for Complaint Operations
 * Verifies that the authenticated actor has territorial or administrative jurisdiction over the target complaint.
 */
export function authorizeComplaintAction(
  action: 'read' | 'acknowledge' | 'update' | 'resolve' | 'reassign' | 'verify'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required for this operation.' });
      return;
    }

    const { role, userId, allowedWards, phoneNumber } = req.user;

    // Administrators and Control Room Operators have universal governance
    if (role === 'admin' || role === 'operator' || role === 'zc' || role === 'jc') {
      return next();
    }

    const complaintId = req.params.id;
    if (!complaintId) {
      return next();
    }

    try {
      const complaint = await ComplaintRepository.getComplaintById(complaintId);
      if (!complaint) {
        res.status(404).json({ success: false, error: 'Complaint record not found.' });
        return;
      }

      // 1. Citizen authorization
      if (role === 'citizen') {
        const isOwner =
          complaint.citizenId === userId ||
          complaint.contactNumber.replace(/\D/g, '').slice(-10) === phoneNumber.replace(/\D/g, '').slice(-10);

        if (!isOwner) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Citizens may only access and verify their own grievances.',
          });
          return;
        }

        if (action === 'update' || action === 'resolve' || action === 'reassign' || action === 'acknowledge') {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Citizens cannot modify officer operational status.',
          });
          return;
        }

        return next();
      }

      // 2. Field Officer (JE / CSI) authorization
      if (role === 'je') {
        const isAssigned = complaint.assignedJeId === userId;
        const inWardScope = complaint.wardNumber && allowedWards && allowedWards.includes(complaint.wardNumber);

        if (!isAssigned && !inWardScope) {
          res.status(403).json({
            success: false,
            error: `Forbidden: This complaint is outside your assigned ward territory (${complaint.wardNumber ? `Ward ${complaint.wardNumber}` : 'Unassigned'}).`,
          });
          return;
        }

        if (action === 'reassign' || action === 'verify') {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Field officers cannot reassign or verify-close grievances.',
          });
          return;
        }

        return next();
      }

      // 3. Supervisors (SDO, XEN, SE)
      if (role === 'sdo' || role === 'xen' || role === 'se') {
        // Can read, update, reassign within branch / zone
        if (action === 'resolve') {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Only designated field officers can submit field resolution proof.',
          });
          return;
        }
        return next();
      }

      next();
    } catch (err: any) {
      console.error('[AuthMiddleware] Error checking complaint authorization:', err);
      res.status(500).json({ success: false, error: 'Failed to verify operational permissions.' });
    }
  };
}

/**
 * In-memory Login Rate Limiting (Ponytail ultra mode)
 * Blocks brute-force login attempts (max 5 failed attempts per 15-minute window per IP)
 */
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && entry.blockedUntil > now) {
    const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000);
    res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Please try again in ${remainingSeconds} seconds.`,
    });
    return;
  }

  next();
}

export function recordFailedLogin(req: Request): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };

  entry.attempts += 1;
  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
    entry.attempts = 0;
  }
  loginAttempts.set(ip, entry);
}

export function clearFailedLogin(req: Request): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  loginAttempts.delete(ip);
}
