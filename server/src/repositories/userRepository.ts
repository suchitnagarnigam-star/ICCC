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
    pinHash: string
  ): Promise<DbUser> {
    const pool = getDbPool();
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '').slice(-10);

    const res = await pool.query<DbUser>(
      `INSERT INTO users (name, phone_number, role, designation, pin_hash, is_active)
       VALUES ($1, $2, 'citizen', 'Citizen Complainant', $3, TRUE)
       RETURNING *`,
      [name.trim(), cleanPhone, pinHash]
    );

    return res.rows[0];
  }
}
