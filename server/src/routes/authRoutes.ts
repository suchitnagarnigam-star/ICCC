import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload, UserRole } from '../types/user';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// In-memory mock store for bootstrapping before DB is configured
const MOCK_USERS: Record<string, any> = {
  '9888897201': {
    id: 'usr-je-01',
    name: 'Kulwinder Singh (JE B&R)',
    phoneNumber: '9888897201',
    role: 'je' as UserRole,
    designation: 'Junior Engineer',
    zone: 'A',
    wardNumber: 2,
    branch: 'B&R',
    pinHash: bcrypt.hashSync('1234', 8),
  },
  '9876543210': {
    id: 'usr-op-01',
    name: 'MUKESH (Operator Desk)',
    phoneNumber: '9876543210',
    role: 'operator' as UserRole,
    designation: 'ICCC Control Room Operator',
    pinHash: bcrypt.hashSync('1234', 8),
  },
  '9999999999': {
    id: 'usr-admin-01',
    name: 'ICCC Administrator',
    phoneNumber: '9999999999',
    role: 'admin' as UserRole,
    designation: 'System Administrator',
    pinHash: bcrypt.hashSync('1234', 8),
  },
};

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, pin } = req.body;

  if (!phoneNumber || !pin) {
    res.status(400).json({ success: false, error: 'Phone number and PIN are required.' });
    return;
  }

  const user = MOCK_USERS[phoneNumber];
  if (!user || !bcrypt.compareSync(pin, user.pinHash)) {
    res.status(401).json({ success: false, error: 'Invalid phone number or PIN.' });
    return;
  }

  const payload: JWTPayload = {
    userId: user.id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    role: user.role,
    zone: user.zone,
    wardNumber: user.wardNumber,
    branch: user.branch,
    designation: user.designation,
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });

  res.json({
    success: true,
    token,
    user: payload,
  });
});

router.get('/me', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

export default router;
