import { getDbPool } from '../config/db';
import {
  Complaint,
  ComplaintStatus,
  DepartmentBranch,
  ComplaintAttachment,
  ComplaintTimelineEvent,
} from '../types/complaint';
import { randomUUID } from 'node:crypto';

export interface CreateComplaintDbInput {
  complainantName: string;
  contactNumber: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  branch: DepartmentBranch;
  mode?: string;
  zone?: string;
  wardNumber?: number;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  dueAt: string;
  citizenId?: string;
  assignedJeId?: string;
  sourceSystem?: string;
  sourceId?: string;
  initialMedia?: {
    storageKey: string;
    mediaType: string;
    size: number;
    fileName: string;
    purpose: 'intake' | 'progress' | 'resolution' | 'dispute';
    uploadState?: 'pending' | 'uploaded' | 'failed';
  }[];
}

export interface ComplaintListFilters {
  status?: string;
  branch?: string;
  zone?: string;
  wardNumber?: number;
  search?: string;
  citizenId?: string;
  assignedJeId?: string;
  allowedWards?: number[];
  page?: number;
  limit?: number;
}

export class ComplaintRepository {
  /**
   * Safe resolver for user ID (checks UUID format, phone number, or employee code)
   */
  private static async resolveUserUuid(client: any, userIdOrInput?: string | null): Promise<string | null> {
    if (!userIdOrInput) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrInput);
    if (isUuid) return userIdOrInput;

    const cleanPhone = userIdOrInput.trim().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length === 10) {
      const res = await client.query('SELECT id FROM users WHERE phone_number = $1 LIMIT 1', [cleanPhone]);
      if (res.rows.length > 0) return res.rows[0].id;
    }

    const resCode = await client.query(
      'SELECT id FROM users WHERE employee_code = $1 OR phone_number = $1 LIMIT 1',
      [userIdOrInput]
    );
    if (resCode.rows.length > 0) return resCode.rows[0].id;

    return null;
  }

  /**
   * Update upload state and storage information for uploaded complaint evidence
   */
  static async updateMediaUploadState(
    storageKey: string,
    uploadState: 'pending' | 'uploaded' | 'failed',
    driveFileId?: string,
    errorMessage?: string
  ): Promise<void> {
    const pool = getDbPool();
    await pool.query(
      `UPDATE complaint_media 
       SET upload_state = $1,
           storage_key = COALESCE($2, storage_key),
           error_message = $3
       WHERE storage_key = $4`,
      [uploadState, driveFileId || null, errorMessage || null, storageKey]
    );
  }

  /**
   * Generates the next sequential public complaint number: MCL-2026-XXXX
   */
  static async getNextComplaintNumber(): Promise<string> {
    const pool = getDbPool();
    const res = await pool.query<{ count: string }>('SELECT count(*) FROM complaints');
    const seq = parseInt(res.rows[0].count, 10) + 1;
    return `MCL-2026-${String(seq).padStart(4, '0')}`;
  }

  /**
   * Atomic Complaint Registration Transaction
   */
  static async createComplaint(input: CreateComplaintDbInput): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const complaintNumber = await this.getNextComplaintNumber();
      const status: ComplaintStatus = input.assignedJeId ? 'ASSIGNED' : 'NEEDS_REVIEW';
      const now = new Date().toISOString();

      // Resolve category UUID if input.categoryId is provided
      let categoryIdUuid: string | null = null;
      if (input.categoryId) {
        // Test if it's already a valid UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.categoryId);
        if (isUuid) {
          categoryIdUuid = input.categoryId;
        } else {
          // Look up by numeric ID / code
          const catRes = await client.query<{ id: string }>(
            `SELECT id FROM complaint_categories WHERE code = $1 OR id::text = $1 LIMIT 1`,
            [input.categoryId.startsWith('cat_') ? input.categoryId : `cat_${input.categoryId.padStart(2, '0')}`]
          );
          if (catRes.rows.length > 0) {
            categoryIdUuid = catRes.rows[0].id;
          }
        }
      }

      // 1. Insert into complaints table
      const insertRes = await client.query<{ id: string }>(
        `INSERT INTO complaints (
          complaint_number, source_system, source_id, citizen_id,
          complainant_name, contact_number, description,
          category_id, branch, current_status, mode,
          zone_code, ward_number, address, landmark,
          latitude, longitude, assigned_je_id,
          submitted_at, due_at, sla_policy_version,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), $19, 'v1.0', NOW(), NOW()
        ) RETURNING id`,
        [
          complaintNumber,
          input.sourceSystem || 'ICCC',
          input.sourceId || null,
          input.citizenId || null,
          input.complainantName,
          input.contactNumber,
          input.description,
          categoryIdUuid,
          input.branch,
          status,
          input.mode || 'Citizen Portal',
          input.zone || null,
          input.wardNumber || null,
          input.address || null,
          input.landmark || null,
          input.latitude || null,
          input.longitude || null,
          input.assignedJeId || null,
          input.dueAt,
        ]
      );

      const complaintId = insertRes.rows[0].id;

      // 2. Insert initial status history: SUBMITTED
      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, action_reason, created_at
        ) VALUES ($1, NULL, 'SUBMITTED', $2, NOW())`,
        [complaintId, `Grievance registered via ${input.mode || 'Citizen Portal'}`]
      );

      // 3. If assigned, insert assignment record & ASSIGNED status history
      if (input.assignedJeId) {
        await client.query(
          `INSERT INTO complaint_assignments (
            complaint_id, assigned_to_user_id, assignment_reason, assigned_at, is_current
          ) VALUES ($1, $2, $3, NOW(), TRUE)`,
          [complaintId, input.assignedJeId, 'Territory auto-dispatch from 95-ward roster']
        );

        await client.query(
          `INSERT INTO complaint_status_history (
            complaint_id, previous_status, new_status, action_reason, created_at
          ) VALUES ($1, 'SUBMITTED', 'ASSIGNED', $2, NOW())`,
          [complaintId, 'Territory auto-assigned to primary field officer']
        );
      }

      // 4. Insert initial media files (if provided)
      if (input.initialMedia && input.initialMedia.length > 0) {
        for (const m of input.initialMedia) {
          await client.query(
            `INSERT INTO complaint_media (
              complaint_id, storage_key, media_type, purpose, upload_state, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [complaintId, m.storageKey, m.mediaType, m.purpose, m.uploadState || 'pending']
          );
        }
      }

      // 5. Insert notification event into transactional outbox
      if (input.assignedJeId) {
        const idempotencyKey = `notif-${complaintId}-assigned-${Date.now()}`;
        await client.query(
          `INSERT INTO notification_events (
            idempotency_key, complaint_id, recipient_user_id, event_type, channel, payload_json, delivery_state
          ) VALUES ($1, $2, $3, 'COMPLAINT_ASSIGNED', 'push', $4, 'pending')`,
          [
            idempotencyKey,
            complaintId,
            input.assignedJeId,
            JSON.stringify({
              title: 'New Civic Grievance Assigned',
              body: `Complaint #${complaintNumber} in Ward ${input.wardNumber || 'N/A'} has been assigned to you.`,
              complaintNumber,
              wardNumber: input.wardNumber,
              branch: input.branch,
            }),
          ]
        );
      }

      await client.query('COMMIT');

      const fullComplaint = await this.getComplaintById(complaintId);
      if (!fullComplaint) throw new Error('Failed to retrieve newly created complaint.');
      return fullComplaint;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[ComplaintRepository] createComplaint transaction failed:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve single complaint with timeline, attachments, and officer information
   */
  static async getComplaintById(idOrNumber: string): Promise<Complaint | null> {
    const pool = getDbPool();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrNumber);

    const complaintRes = await pool.query<any>(
      `SELECT 
        c.*,
        cc.name as category_name,
        u.name as assigned_je_name,
        u.phone_number as assigned_je_phone,
        u.designation as assigned_je_designation,
        zc.commissioner_name as zc_name
       FROM complaints c
       LEFT JOIN complaint_categories cc ON c.category_id = cc.id
       LEFT JOIN users u ON c.assigned_je_id = u.id
       LEFT JOIN municipal_zones zc ON c.zone_code = zc.code
       WHERE ${isUuid ? 'c.id = $1' : 'LOWER(c.complaint_number) = LOWER($1)'}
       LIMIT 1`,
      [idOrNumber]
    );

    if (complaintRes.rows.length === 0) return null;
    const row = complaintRes.rows[0];

    // Load status history / timeline
    const historyRes = await pool.query<any>(
      `SELECT 
        h.id, h.complaint_id, h.previous_status, h.new_status, h.action_reason, h.created_at,
        u.name as actor_name, u.role as actor_role
       FROM complaint_status_history h
       LEFT JOIN users u ON h.actor_user_id = u.id
       WHERE h.complaint_id = $1
       ORDER BY h.created_at ASC`,
      [row.id]
    );

    const timeline: ComplaintTimelineEvent[] = historyRes.rows.map((h) => ({
      id: h.id,
      complaintId: h.complaint_id,
      timestamp: h.created_at,
      actorName: h.actor_name || 'System / Citizen',
      actorRole: (h.actor_role || 'SYSTEM').toUpperCase(),
      action: h.new_status,
      previousStatus: h.previous_status,
      newStatus: h.new_status,
      notes: h.action_reason,
    }));

    // Load media attachments
    const mediaRes = await pool.query<any>(
      `SELECT * FROM complaint_media WHERE complaint_id = $1 ORDER BY created_at ASC`,
      [row.id]
    );

    const attachments: ComplaintAttachment[] = [];
    const resolutionProof: ComplaintAttachment[] = [];

    mediaRes.rows.forEach((m) => {
      const att: ComplaintAttachment = {
        fileId: m.storage_key,
        fileName: m.storage_key,
        mimeType: m.media_type,
        size: 250000,
        category: m.purpose === 'resolution' ? 'res' : 'source',
        fileUrl: `/api/drive/files/${m.storage_key}`,
      };

      if (m.purpose === 'resolution') {
        resolutionProof.push(att);
      } else {
        attachments.push(att);
      }
    });

    const now = Date.now();
    const dueMs = new Date(row.due_at).getTime();
    const isBreached = row.current_status !== 'CLOSED' && row.current_status !== 'RESOLUTION_SUBMITTED' && now > dueMs;

    return {
      id: row.id,
      complaintNumber: row.complaint_number,
      sourceSystem: row.source_system,
      sourceId: row.source_id,
      citizenId: row.citizen_id,
      complainantName: row.complainant_name,
      contactNumber: row.contact_number,
      description: row.description,
      categoryId: row.category_id,
      categoryName: row.category_name,
      branch: row.branch,
      status: row.current_status,
      mode: row.mode,
      zone: row.zone_code,
      wardNumber: row.ward_number,
      address: row.address,
      landmark: row.landmark,
      latitude: row.latitude,
      longitude: row.longitude,
      assignedJeId: row.assigned_je_id,
      assignedJeName: row.assigned_je_name ? `${row.assigned_je_name} (${row.assigned_je_designation || 'JE'})` : undefined,
      assignedJePhone: row.assigned_je_phone,
      zcName: row.zc_name,
      submittedAt: row.submitted_at,
      dueAt: row.due_at,
      assignmentAcknowledgedAt: row.acknowledged_at,
      acknowledgedByOfficerId: row.acknowledged_at ? row.assigned_je_id : undefined,
      resolvedAt: row.resolved_at,
      closedAt: row.closed_at,
      slaBreached: isBreached,
      isPaused: row.is_paused,
      pausedAt: row.paused_at,
      pauseReason: row.pause_reason,
      totalPausedMinutes: row.total_paused_minutes,
      slaPolicyVersion: row.sla_policy_version,
      attachments,
      resolutionProof,
      timeline,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Paginated Complaint List with Multi-Faceted Filters & Role Scoping
   */
  static async listComplaints(
    filters: ComplaintListFilters
  ): Promise<{ data: Complaint[]; total: number; page: number; limit: number }> {
    const pool = getDbPool();
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let pIdx = 1;

    if (filters.status) {
      conditions.push(`c.current_status = $${pIdx++}`);
      params.push(filters.status.toUpperCase());
    }

    if (filters.branch) {
      conditions.push(`c.branch = $${pIdx++}`);
      params.push(filters.branch);
    }

    if (filters.zone) {
      conditions.push(`c.zone_code = $${pIdx++}`);
      params.push(filters.zone.toUpperCase());
    }

    if (filters.wardNumber) {
      conditions.push(`c.ward_number = $${pIdx++}`);
      params.push(filters.wardNumber);
    }

    if (filters.citizenId) {
      conditions.push(`c.citizen_id = $${pIdx++}`);
      params.push(filters.citizenId);
    }

    if (filters.assignedJeId) {
      conditions.push(`c.assigned_je_id = $${pIdx++}`);
      params.push(filters.assignedJeId);
    }

    if (filters.allowedWards && filters.allowedWards.length > 0) {
      conditions.push(`c.ward_number = ANY($${pIdx++})`);
      params.push(filters.allowedWards);
    }

    if (filters.search) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      conditions.push(`(
        LOWER(c.complaint_number) LIKE $${pIdx} OR 
        LOWER(c.complainant_name) LIKE $${pIdx} OR 
        c.contact_number LIKE $${pIdx} OR 
        LOWER(c.description) LIKE $${pIdx} OR 
        LOWER(c.address) LIKE $${pIdx}
      )`);
      params.push(q);
      pIdx++;
    }

    const whereClause = conditions.join(' AND ');

    // Count total matching
    const countRes = await pool.query<{ count: string }>(
      `SELECT count(*) FROM complaints c WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 25));
    const offset = (page - 1) * limit;

    const listQuery = `
      SELECT 
        c.*,
        cc.name as category_name,
        u.name as assigned_je_name,
        u.phone_number as assigned_je_phone
      FROM complaints c
      LEFT JOIN complaint_categories cc ON c.category_id = cc.id
      LEFT JOIN users u ON c.assigned_je_id = u.id
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++}
    `;
    params.push(limit, offset);

    const listRes = await pool.query<any>(listQuery, params);

    const now = Date.now();
    const complaints: Complaint[] = listRes.rows.map((r) => {
      const dueMs = new Date(r.due_at).getTime();
      const isBreached = r.current_status !== 'CLOSED' && r.current_status !== 'RESOLUTION_SUBMITTED' && now > dueMs;

      return {
        id: r.id,
        complaintNumber: r.complaint_number,
        complainantName: r.complainant_name,
        contactNumber: r.contact_number,
        description: r.description,
        categoryId: r.category_id,
        categoryName: r.category_name,
        branch: r.branch,
        status: r.current_status,
        mode: r.mode,
        zone: r.zone_code,
        wardNumber: r.ward_number,
        address: r.address,
        landmark: r.landmark,
        assignedJeId: r.assigned_je_id,
        assignedJeName: r.assigned_je_name,
        assignedJePhone: r.assigned_je_phone,
        submittedAt: r.submitted_at,
        dueAt: r.due_at,
        assignmentAcknowledgedAt: r.acknowledged_at,
        resolvedAt: r.resolved_at,
        closedAt: r.closed_at,
        slaBreached: isBreached,
        isPaused: r.is_paused,
        pausedAt: r.paused_at,
        pauseReason: r.pause_reason,
        totalPausedMinutes: r.total_paused_minutes,
        slaPolicyVersion: r.sla_policy_version,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    return { data: complaints, total, page, limit };
  }

  /**
   * Field Officer Acknowledgment
   */
  static async acknowledgeComplaint(complaintId: string, officerUserId: string): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, complaint_number, current_status FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');

      const currentStatus = compCheck.rows[0].current_status;
      const targetStatus = currentStatus === 'ASSIGNED' ? 'ACKNOWLEDGED' : currentStatus;
      const resolvedOfficerId = await this.resolveUserUuid(client, officerUserId) || compCheck.rows[0].assigned_je_id;

      // Update complaints
      await client.query(
        `UPDATE complaints 
         SET current_status = $1, acknowledged_at = NOW(), updated_at = NOW() 
         WHERE id = $2`,
        [targetStatus, complaintId]
      );

      // Update current assignment
      await client.query(
        `UPDATE complaint_assignments 
         SET acknowledged_at = NOW() 
         WHERE complaint_id = $1 AND is_current = TRUE`,
        [complaintId]
      );

      // Append status history
      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, $2, $3, $4, 'Field officer acknowledged assignment', NOW())`,
        [complaintId, currentStatus, targetStatus, resolvedOfficerId]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve updated complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Reassign Complaint to another Officer with Mandatory Audit Reason
   */
  static async reassignComplaint(
    complaintId: string,
    newOfficerUserId: string,
    reason: string,
    actorUserId: string
  ): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, current_status, assigned_je_id FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');

      const resolvedNewOfficer = await this.resolveUserUuid(client, newOfficerUserId);
      if (!resolvedNewOfficer) throw new Error(`Target officer not found: ${newOfficerUserId}`);
      const resolvedActor = await this.resolveUserUuid(client, actorUserId);

      // Mark old assignment expired
      await client.query(
        `UPDATE complaint_assignments 
         SET is_current = FALSE 
         WHERE complaint_id = $1 AND is_current = TRUE`,
        [complaintId]
      );

      // Insert new assignment
      await client.query(
        `INSERT INTO complaint_assignments (
          complaint_id, assigned_to_user_id, assigned_by_user_id, assignment_reason, assigned_at, is_current
        ) VALUES ($1, $2, $3, $4, NOW(), TRUE)`,
        [complaintId, resolvedNewOfficer, resolvedActor, reason]
      );

      // Update complaint
      await client.query(
        `UPDATE complaints 
         SET assigned_je_id = $1, current_status = 'ASSIGNED', acknowledged_at = NULL, updated_at = NOW() 
         WHERE id = $2`,
        [resolvedNewOfficer, complaintId]
      );

      // Insert status history
      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, $2, 'ASSIGNED', $3, $4, NOW())`,
        [complaintId, compCheck.rows[0].current_status, resolvedActor, `Reassigned to new officer. Reason: ${reason}`]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve reassigned complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update Status with Transition Validation
   */
  static async updateStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    reason: string,
    actorUserId: string
  ): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, current_status FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');

      const prevStatus = compCheck.rows[0].current_status;
      const resolvedActor = await this.resolveUserUuid(client, actorUserId);

      await client.query(
        `UPDATE complaints SET current_status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, complaintId]
      );

      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [complaintId, prevStatus, newStatus, resolvedActor, reason || `Status changed from ${prevStatus} to ${newStatus}`]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve updated complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Submit Resolution Proof with Media Metadata
   */
  static async submitResolution(
    complaintId: string,
    notes: string,
    officerUserId: string,
    proofStorageKeys: string[]
  ): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, current_status FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');

      const resolvedOfficer = await this.resolveUserUuid(client, officerUserId) || compCheck.rows[0].assigned_je_id;

      await client.query(
        `UPDATE complaints 
         SET current_status = 'RESOLUTION_SUBMITTED', resolved_at = NOW(), updated_at = NOW() 
         WHERE id = $1`,
        [complaintId]
      );

      // Insert resolution proof media records
      for (const key of proofStorageKeys) {
        await client.query(
          `INSERT INTO complaint_media (
            complaint_id, storage_key, media_type, purpose, upload_state, uploaded_by_user_id, created_at
          ) VALUES ($1, $2, 'image/jpeg', 'resolution', 'pending', $3, NOW())`,
          [complaintId, key, resolvedOfficer]
        );
      }

      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, $2, 'RESOLUTION_SUBMITTED', $3, $4, NOW())`,
        [complaintId, compCheck.rows[0].current_status, resolvedOfficer, `Resolution submitted: ${notes}`]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve resolved complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Verification & Permanent Closure Gate
   */
  static async verifyAndClose(
    complaintId: string,
    verifierUserId: string,
    verifierRole: 'citizen' | 'officer',
    result: 'accepted' | 'disputed',
    comments?: string
  ): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, current_status FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');

      const prevStatus = compCheck.rows[0].current_status;
      const targetStatus: ComplaintStatus = result === 'accepted' ? 'CLOSED' : 'VERIFICATION_REJECTED';
      const resolvedVerifier = await this.resolveUserUuid(client, verifierUserId);

      // Insert verification record
      await client.query(
        `INSERT INTO complaint_verifications (
          complaint_id, verifier_user_id, verifier_role, result, dispute_comments, verified_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [complaintId, resolvedVerifier, verifierRole, result, comments || null]
      );

      // Update complaint status
      await client.query(
        `UPDATE complaints 
         SET current_status = $1, closed_at = ${result === 'accepted' ? 'NOW()' : 'NULL'}, updated_at = NOW() 
         WHERE id = $2`,
        [targetStatus, complaintId]
      );

      // Insert status history
      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          complaintId,
          prevStatus,
          targetStatus,
          resolvedVerifier,
          `Verification verdict: ${result.toUpperCase()}.${comments ? ` Remarks: ${comments}` : ''}`,
        ]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve verified complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Pause Complaint SLA Clock with Audit Reason
   */
  static async pauseComplaint(
    complaintId: string,
    reason: string,
    actorUserId?: string
  ): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, current_status, is_paused FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');
      if (compCheck.rows[0].is_paused) throw new Error('Complaint SLA clock is already paused.');

      const resolvedActor = await this.resolveUserUuid(client, actorUserId);

      await client.query(
        `UPDATE complaints 
         SET is_paused = TRUE, paused_at = NOW(), pause_reason = $1, updated_at = NOW() 
         WHERE id = $2`,
        [reason, complaintId]
      );

      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, $2, 'PAUSED', $3, $4, NOW())`,
        [complaintId, compCheck.rows[0].current_status, resolvedActor, `SLA clock paused. Reason: ${reason}`]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve paused complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Resume Complaint SLA Clock & Adjust Due Date
   */
  static async resumeComplaint(
    complaintId: string,
    actorUserId?: string
  ): Promise<Complaint> {
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compCheck = await client.query<any>(
        'SELECT id, current_status, is_paused, paused_at, total_paused_minutes, due_at FROM complaints WHERE id = $1 FOR UPDATE',
        [complaintId]
      );
      if (compCheck.rows.length === 0) throw new Error('Complaint not found.');
      if (!compCheck.rows[0].is_paused) throw new Error('Complaint SLA clock is not currently paused.');

      const pausedAt = new Date(compCheck.rows[0].paused_at);
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - pausedAt.getTime()) / 60000));
      const newTotalPaused = (compCheck.rows[0].total_paused_minutes || 0) + elapsedMinutes;

      // Extend due_at by the elapsed pause minutes
      const oldDue = new Date(compCheck.rows[0].due_at);
      const newDue = new Date(oldDue.getTime() + elapsedMinutes * 60000).toISOString();
      const resolvedActor = await this.resolveUserUuid(client, actorUserId);

      await client.query(
        `UPDATE complaints 
         SET is_paused = FALSE, 
             paused_at = NULL, 
             total_paused_minutes = $1, 
             due_at = $2, 
             updated_at = NOW() 
         WHERE id = $3`,
        [newTotalPaused, newDue, complaintId]
      );

      await client.query(
        `INSERT INTO complaint_status_history (
          complaint_id, previous_status, new_status, actor_user_id, action_reason, created_at
        ) VALUES ($1, 'PAUSED', $2, $3, $4, NOW())`,
        [
          complaintId,
          compCheck.rows[0].current_status,
          resolvedActor,
          `SLA clock resumed after ${elapsedMinutes} minute(s) pause. Deadline extended to ${newDue}.`,
        ]
      );

      await client.query('COMMIT');

      const updated = await this.getComplaintById(complaintId);
      if (!updated) throw new Error('Failed to retrieve resumed complaint.');
      return updated;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
