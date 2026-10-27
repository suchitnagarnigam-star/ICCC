import { Router, Request, Response } from 'express';
import { getDriveFileBuffer } from '../services/driveService';
import { authenticateToken } from '../middleware/auth';
import { getDbPool } from '../config/db';

const router = Router();

// Strictly safe raster image and document MIME types permitted for inline rendering
const ALLOWED_INLINE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'application/pdf',
]);

/**
 * GET /api/drive/files/:fileId
 * Streams a Google Drive or locally cached file with strict authentication, complaint-level authorization,
 * and private no-store headers to prevent leakage of citizen and grievance evidence.
 * Enforces fail-closed: unassociated files are never streamed.
 * Prohibits inline execution of SVGs to eliminate stored XSS risks.
 */
router.get('/files/:fileId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.fileId;
  const fileId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!fileId || typeof fileId !== 'string' || !/^[a-zA-Z0-9_.-]{3,120}$/.test(fileId)) {
    res.status(400).json({ success: false, error: 'Invalid file ID format.' });
    return;
  }

  try {
    const pool = getDbPool();
    const mediaRes = await pool.query<any>(
      `SELECT cm.*, c.citizen_id, c.contact_number, c.assigned_je_id, c.ward_number, c.branch, c.zone_code
       FROM complaint_media cm
       JOIN complaints c ON cm.complaint_id = c.id
       WHERE cm.storage_key = $1 OR cm.drive_file_id = $1
       LIMIT 1`,
      [fileId]
    );

    // Fail-Closed: Files not indexed in complaint_media are rejected immediately
    if (mediaRes.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Media file not found or not associated with an authorized grievance record.',
      });
      return;
    }

    const media = mediaRes.rows[0];
    const user = req.user!;

    // 1. Universal governance for admin, operator, and municipal executives
    const isExecutive = ['admin', 'operator', 'zc', 'jc'].includes(user.role);

    // 2. Ownership verification for citizens
    const cleanUserPhone = (user.phoneNumber || '').replace(/\D/g, '').slice(-10);
    const cleanCompPhone = (media.contact_number || '').replace(/\D/g, '').slice(-10);
    const isOwnerCitizen =
      user.role === 'citizen' &&
      (media.citizen_id === user.userId || (cleanUserPhone.length === 10 && cleanUserPhone === cleanCompPhone));

    // 3. Territorial assignment verification for Field JEs
    const isAssignedOfficer =
      user.role === 'je' &&
      (media.assigned_je_id === user.userId ||
        (user.allowedWards && user.allowedWards.includes(media.ward_number)));

    // 4. Departmental and zonal verification for Supervisors (SDO, XEN, SE)
    let isAuthorizedSupervisor = false;
    if (['sdo', 'xen', 'se'].includes(user.role)) {
      const branchMatches = !user.branch || !media.branch || user.branch === media.branch;
      const zoneMatches = !user.zone || !media.zone_code || user.zone === media.zone_code;
      isAuthorizedSupervisor = branchMatches && zoneMatches;
    }

    if (!isExecutive && !isOwnerCitizen && !isAssignedOfficer && !isAuthorizedSupervisor) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to view evidence for this complaint.',
      });
      return;
    }

    const file = await getDriveFileBuffer(fileId);

    if (!file) {
      res.status(404).json({ success: false, error: 'Media file content not found or expired.' });
      return;
    }

    const rawMime = file.mimeType ? file.mimeType.toLowerCase() : 'image/jpeg';

    // SVG / XML Sanitization: Never render inline to prevent Stored XSS
    if (rawMime.includes('svg') || rawMime.includes('xml')) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename="evidence.svg"');
    } else if (ALLOWED_INLINE_MIME_TYPES.has(rawMime)) {
      res.setHeader('Content-Type', rawMime);
      if (rawMime === 'application/pdf') {
        res.setHeader('Content-Disposition', 'inline; filename="evidence.pdf"');
      }
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }

    res.setHeader('Content-Length', file.buffer.length);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).send(file.buffer);
  } catch (error: any) {
    console.error(`[DriveRoute] Error streaming file ${fileId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to stream media file.' });
  }
});

export default router;
