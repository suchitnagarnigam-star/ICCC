import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload, UserRole } from '../types/user';
import {
  authenticateToken,
  checkLoginRateLimit,
  recordFailedLogin,
  clearFailedLogin,
} from '../middleware/auth';
import { UserRepository } from '../repositories/userRepository';

const router = Router();

/**
 * POST /api/auth/login
 * Municipal Staff Login (JE, SDO, XEN, SE, ZC, JC, Operator, Admin)
 * Authenticates against Neon PostgreSQL users table with bcrypt PIN verification.
 */
router.post('/login', checkLoginRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, pin } = req.body;

  if (!phoneNumber || !pin) {
    res.status(400).json({ success: false, error: 'Phone number and PIN are required.' });
    return;
  }

  const cleanPhone = String(phoneNumber).trim().replace(/\D/g, '').slice(-10);
  const user = await UserRepository.findByPhoneNumber(cleanPhone);

  if (!user || !user.is_active) {
    recordFailedLogin(req);
    res.status(401).json({ success: false, error: 'Invalid official phone number or PIN.' });
    return;
  }

  const pinMatches = await bcrypt.compare(String(pin), user.pin_hash);
  if (!pinMatches) {
    recordFailedLogin(req);
    res.status(401).json({ success: false, error: 'Invalid official phone number or PIN.' });
    return;
  }

  clearFailedLogin(req);

  // Load all assigned wards and branches for this staff officer
  const assignments = await UserRepository.getUserAreaAssignments(user.id);
  const allowedWards = Array.from(new Set(assignments.map((a) => a.ward_number)));

  const payload: JWTPayload = {
    userId: user.id,
    name: user.name,
    phoneNumber: user.phone_number,
    role: user.role as UserRole,
    zone: user.zone_code,
    wardNumber: user.ward_number,
    branch: user.branch,
    designation: user.designation,
    allowedWards,
    isPhoneVerified: true,
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });

  res.json({
    success: true,
    message: 'Staff authentication successful.',
    token,
    user: payload,
  });
});

/**
 * POST /api/auth/citizen/send-otp
 * Generates and stores a 6-digit verification code with 5-minute validity
 */
router.post('/citizen/send-otp', checkLoginRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber } = req.body || {};
  if (!phoneNumber) {
    res.status(400).json({ success: false, error: 'Phone number is required.' });
    return;
  }

  const cleanPhone = String(phoneNumber).trim().replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    res.status(400).json({ success: false, error: 'Please provide a valid 10-digit mobile number.' });
    return;
  }

  try {
    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    await UserRepository.createPhoneVerificationOtp(cleanPhone, otpCode, 5);

    // In production, integrate with SMS gateway; in dev/test, return OTP in response for automated verification
    const isDev = ENV.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: 'Verification OTP sent successfully (valid for 5 minutes).',
      phoneNumber: cleanPhone,
      expiresInSeconds: 300,
      ...(isDev ? { debugOtp: otpCode } : {}),
    });
  } catch (error: any) {
    console.error('[AuthRoutes] Error sending OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to generate verification OTP.' });
  }
});

/**
 * POST /api/auth/citizen/verify-otp
 * Confirms possession of mobile number and updates user verification state
 */
router.post('/citizen/verify-otp', checkLoginRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, otp } = req.body || {};
  if (!phoneNumber || !otp) {
    res.status(400).json({ success: false, error: 'Both phoneNumber and otp are required.' });
    return;
  }

  const cleanPhone = String(phoneNumber).trim().replace(/\D/g, '').slice(-10);
  try {
    const verified = await UserRepository.verifyPhoneOtp(cleanPhone, String(otp).trim());
    if (!verified) {
      res.status(400).json({ success: false, error: 'Invalid or expired verification OTP.' });
      return;
    }

    res.json({
      success: true,
      message: 'Mobile number ownership verified successfully.',
      phoneNumber: cleanPhone,
    });
  } catch (error: any) {
    console.error('[AuthRoutes] Error verifying OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to verify OTP.' });
  }
});

/**
 * POST /api/auth/citizen/register
 * Citizen Account Self-Registration (supports verified or unverified states)
 */
router.post('/citizen/register', checkLoginRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { name, phoneNumber, pin, otp } = req.body;

  if (!name || !phoneNumber || !pin) {
    res.status(400).json({ success: false, error: 'Full name, phone number, and 4-digit PIN are required.' });
    return;
  }

  const cleanPhone = String(phoneNumber).trim().replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
    return;
  }

  if (String(pin).trim().length < 4) {
    res.status(400).json({ success: false, error: 'PIN must be at least 4 digits.' });
    return;
  }

  // Check if account already exists
  const existingUser = await UserRepository.findByPhoneNumber(cleanPhone);
  if (existingUser) {
    res.status(409).json({
      success: false,
      error: 'An account with this phone number already exists. Please login.',
    });
    return;
  }

  try {
    let isPhoneVerified = false;
    if (otp) {
      const verified = await UserRepository.verifyPhoneOtp(cleanPhone, String(otp).trim());
      if (!verified) {
        res.status(400).json({ success: false, error: 'Invalid or expired OTP provided during registration.' });
        return;
      }
      isPhoneVerified = true;
    }

    const pinHash = await bcrypt.hash(String(pin).trim(), 10);
    const citizen = await UserRepository.createCitizenUser(String(name).trim(), cleanPhone, pinHash, isPhoneVerified);

    const payload: JWTPayload = {
      userId: citizen.id,
      name: citizen.name,
      phoneNumber: citizen.phone_number,
      role: 'citizen',
      isPhoneVerified,
    };

    const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });

    res.status(201).json({
      success: true,
      message: 'Citizen account registered successfully.',
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error('[AuthRoutes] Error registering citizen:', error);
    res.status(500).json({ success: false, error: 'Failed to create citizen account.' });
  }
});

/**
 * POST /api/auth/citizen/login
 * Citizen Authentication via Phone and PIN
 */
router.post('/citizen/login', checkLoginRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { phoneNumber, pin } = req.body;

  if (!phoneNumber || !pin) {
    res.status(400).json({ success: false, error: 'Phone number and PIN are required.' });
    return;
  }

  const cleanPhone = String(phoneNumber).trim().replace(/\D/g, '').slice(-10);
  const user = await UserRepository.findByPhoneNumber(cleanPhone);

  if (!user || user.role !== 'citizen' || !user.is_active) {
    recordFailedLogin(req);
    res.status(401).json({ success: false, error: 'Invalid citizen phone number or PIN.' });
    return;
  }

  const pinMatches = await bcrypt.compare(String(pin), user.pin_hash);
  if (!pinMatches) {
    recordFailedLogin(req);
    res.status(401).json({ success: false, error: 'Invalid citizen phone number or PIN.' });
    return;
  }

  clearFailedLogin(req);

  const payload: JWTPayload = {
    userId: user.id,
    name: user.name,
    phoneNumber: user.phone_number,
    role: 'citizen',
    isPhoneVerified: Boolean(user.is_phone_verified),
  };

  const token = jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });

  res.json({
    success: true,
    message: 'Citizen authentication successful.',
    token,
    user: payload,
  });
});

/**
 * GET /api/auth/me
 * Returns currently authenticated user context and assigned operational scope.
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserRepository.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User profile not found.' });
      return;
    }

    const assignments = await UserRepository.getUserAreaAssignments(user.id);
    const allowedWards = Array.from(new Set(assignments.map((a) => a.ward_number)));

    res.json({
      success: true,
      user: {
        userId: user.id,
        name: user.name,
        phoneNumber: user.phone_number,
        role: user.role,
        zone: user.zone_code,
        wardNumber: user.ward_number,
        branch: user.branch,
        designation: user.designation,
        allowedWards,
        isPhoneVerified: Boolean(user.is_phone_verified),
        assignments,
      },
    });
  } catch (err: any) {
    console.error('[AuthRoutes] /me error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile.' });
  }
});

export default router;
