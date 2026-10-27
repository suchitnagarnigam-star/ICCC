import { getDbPool } from '../config/db';
import { UserRole } from '../types/user';

export interface DbUser {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  role: UserRole;
  designation?: string;
  employee_code?: string;
  pin_hash: string;
  zone_code?: string;
  ward_number?: number;
  branch?: string;
  is_active: boolean;
  is_phone_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAreaAssignment {
  branch: string;
  ward_number: number;
  zone_code: string;
  is_primary: boolean;
}

export class UserRepository {
  /**
   * Find an active user by official phone number
   */
  static async findByPhoneNumber(phoneNumber: string): Promise<DbUser | null> {
    const pool = getDbPool();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);

    const res = await pool.query<DbUser>(
      `SELECT * FROM users WHERE phone_number = $1 AND is_active = TRUE LIMIT 1`,
      [cleanPhone]
    );

    return res.rows[0] || null;
  }

  /**
   * Find user by UUID
   */
  static async findById(userId: string): Promise<DbUser | null> {
    const pool = getDbPool();
    const res = await pool.query<DbUser>(
      `SELECT * FROM users WHERE id = $1 AND is_active = TRUE LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  }

  /**
   * Get all territorial area assignments for a staff officer
   */
  static async getUserAreaAssignments(userId: string): Promise<UserAreaAssignment[]> {
    const pool = getDbPool();
    const res = await pool.query<UserAreaAssignment>(
      `SELECT branch, ward_number, zone_code, is_primary 
       FROM staff_area_assignments 
       WHERE user_id = $1`,
      [userId]
    );
    return res.rows;
  }

  /**
   * Find the designated primary field officer (JE / CSI) for a specific ward and branch
   */
  static async findOfficerForWardAndBranch(
    wardNumber: number,
    branch: string
  ): Promise<DbUser | null> {
    const pool = getDbPool();
    const res = await pool.query<DbUser>(
      `SELECT u.* 
       FROM users u
       JOIN staff_area_assignments saa ON u.id = saa.user_id
       WHERE saa.ward_number = $1 
         AND saa.branch = $2 
         AND saa.is_primary = TRUE 
         AND u.is_active = TRUE
       LIMIT 1`,
      [wardNumber, branch]
    );

    return res.rows[0] || null;
  }

  /**
   * Register a new citizen account
   */
  static async createCitizenUser(
    name: string,
    phoneNumber: string,
    pinHash: string,
    isPhoneVerified: boolean = false
  ): Promise<DbUser> {
    const pool = getDbPool();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);

    const res = await pool.query<DbUser>(
      `INSERT INTO users (name, phone_number, role, designation, pin_hash, is_active, is_phone_verified)
       VALUES ($1, $2, 'citizen', 'Citizen Complainant', $3, TRUE, $4)
       RETURNING *`,
      [name.trim(), cleanPhone, pinHash, isPhoneVerified]
    );

    return res.rows[0];
  }

  /**
   * Store a generated 6-digit OTP for phone ownership verification
   */
  static async createPhoneVerificationOtp(
    phoneNumber: string,
    otpCode: string,
    expiryMinutes: number = 5
  ): Promise<void> {
    const pool = getDbPool();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);
    // Invalidate prior unused OTPs for this phone
    await pool.query('UPDATE phone_verification_otps SET is_used = TRUE WHERE phone_number = $1', [cleanPhone]);
    await pool.query(
      `INSERT INTO phone_verification_otps (phone_number, otp_code, expires_at)
       VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)`,
      [cleanPhone, otpCode, String(expiryMinutes)]
    );
  }

  /**
   * Verify an entered OTP and mark user as verified in database
   */
  static async verifyPhoneOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
    const pool = getDbPool();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);
    const res = await pool.query<any>(
      `SELECT id FROM phone_verification_otps 
       WHERE phone_number = $1 AND otp_code = $2 AND is_used = FALSE AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [cleanPhone, otpCode.trim()]
    );
    if (res.rows.length === 0) return false;

    const otpId = res.rows[0].id;
    await pool.query('UPDATE phone_verification_otps SET is_used = TRUE WHERE id = $1', [otpId]);
    await pool.query('UPDATE users SET is_phone_verified = TRUE, updated_at = NOW() WHERE phone_number = $1', [cleanPhone]);
    return true;
  }
}

