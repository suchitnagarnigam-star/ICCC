import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload, UserRole } from '../types/user';
import { ComplaintRepository } from '../repositories/complaintRepository';
import { getDbPool } from '../config/db';

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

      // 3. Supervisors (SDO, XEN, SE) - Strictly Fail Closed
      if (role === 'sdo' || role === 'xen' || role === 'se') {
        if (action === 'resolve') {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Only designated field officers can submit field resolution proof.',
          });
          return;
        }

        // Fail-Closed: Supervisor MUST have an assigned departmental branch
        if (!req.user.branch) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: Supervisor account has no assigned departmental branch.',
          });
          return;
        }

        // Branch matching (e.g. O&M, B&R, Light, Health)
        if (!complaint.branch || req.user.branch.toUpperCase() !== complaint.branch.toUpperCase()) {
          res.status(403).json({
            success: false,
            error: `Forbidden: Supervisor branch (${req.user.branch}) does not match complaint branch (${complaint.branch || 'unassigned'}).`,
          });
          return;
        }

        // Zonal matching if supervisor has an assigned zone
        if (req.user.zone && complaint.zone && req.user.zone.toUpperCase() !== complaint.zone.toUpperCase()) {
          res.status(403).json({
            success: false,
            error: `Forbidden: Supervisor zone (${req.user.zone}) does not match complaint zone (${complaint.zone}).`,
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
 * Persistent Rate Limiting backed by PostgreSQL rate_limit_entries table
 * Multi-instance resilient and survives server restarts
 */
interface InMemoryRateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, InMemoryRateLimitEntry>();

export async function checkLoginRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 50);
  const key = `login:${ip}`;

  try {
    const pool = getDbPool();
    const resEntry = await pool.query<any>(
      'SELECT hits, reset_at FROM rate_limit_entries WHERE key = $1 LIMIT 1',
      [key]
    );

    if (resEntry.rows.length > 0) {
      const entry = resEntry.rows[0];
      const now = Date.now();
      const resetTime = new Date(entry.reset_at).getTime();

      if (resetTime > now) {
        if (entry.hits >= 5) {
          const remainingSeconds = Math.ceil((resetTime - now) / 1000);
          res.status(429).json({
            success: false,
            error: `Too many failed login attempts. Please try again in ${remainingSeconds} seconds.`,
          });
          return;
        }
      } else {
        await pool.query(
          "UPDATE rate_limit_entries SET hits = 0, reset_at = NOW() + INTERVAL '15 minutes' WHERE key = $1",
          [key]
        );
      }
    }
  } catch (err) {
    // In-memory fallback
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
  }

  next();
}

export async function recordFailedLogin(req: Request): Promise<void> {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 50);
  const key = `login:${ip}`;

  try {
    const pool = getDbPool();
    await pool.query(
      `INSERT INTO rate_limit_entries (key, hits, reset_at)
       VALUES ($1, 1, NOW() + INTERVAL '15 minutes')
       ON CONFLICT (key) DO UPDATE
       SET hits = CASE WHEN rate_limit_entries.reset_at < NOW() THEN 1 ELSE rate_limit_entries.hits + 1 END,
           reset_at = CASE WHEN rate_limit_entries.reset_at < NOW() THEN NOW() + INTERVAL '15 minutes' ELSE rate_limit_entries.reset_at END`,
      [key]
    );
  } catch (err) {
    // In-memory fallback
    const now = Date.now();
    const entry = loginAttempts.get(ip) || { attempts: 0, blockedUntil: 0 };
    entry.attempts += 1;
    if (entry.attempts >= 5) {
      entry.blockedUntil = now + 15 * 60 * 1000;
      entry.attempts = 0;
    }
    loginAttempts.set(ip, entry);
  }
}

export async function clearFailedLogin(req: Request): Promise<void> {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').slice(0, 50);
  const key = `login:${ip}`;

  try {
    const pool = getDbPool();
    await pool.query('DELETE FROM rate_limit_entries WHERE key = $1', [key]);
  } catch (err) {
    loginAttempts.delete(ip);
  }
}
