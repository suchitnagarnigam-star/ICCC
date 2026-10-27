import { Router, Request, Response } from 'express';
import { getDriveFileBuffer } from '../services/driveService';
import { authenticateToken } from '../middleware/auth';
import { getDbPool } from '../config/db';

const router = Router();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/svg+xml',
  'application/pdf',
]);

/**
 * GET /api/drive/files/:fileId
 * Streams a Google Drive or locally cached file with strict authentication, complaint-level authorization,
 * and private no-store headers to prevent leakage of citizen and grievance evidence.
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
      `SELECT cm.*, c.citizen_id, c.contact_number, c.assigned_je_id, c.ward_number 
       FROM complaint_media cm
       JOIN complaints c ON cm.complaint_id = c.id
       WHERE cm.storage_key = $1 OR cm.drive_file_id = $1
       LIMIT 1`,
      [fileId]
    );

    // If file is associated with a complaint in DB, enforce strict complaint authorization
    if (mediaRes.rows.length > 0) {
      const media = mediaRes.rows[0];
      const user = req.user!;

      const isPrivileged = ['admin', 'operator', 'zc', 'jc', 'sdo', 'xen', 'se'].includes(user.role);
      const isOwnerCitizen =
        user.role === 'citizen' &&
        (media.citizen_id === user.userId ||
          media.contact_number.replace(/\D/g, '').slice(-10) === user.phoneNumber.replace(/\D/g, '').slice(-10));
      const isAssignedOfficer =
        user.role === 'je' &&
        (media.assigned_je_id === user.userId ||
          (user.allowedWards && user.allowedWards.includes(media.ward_number)));

      if (!isPrivileged && !isOwnerCitizen && !isAssignedOfficer) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have permission to view evidence for this complaint.',
        });
        return;
      }
    }

    const file = await getDriveFileBuffer(fileId);

    if (!file) {
      res.status(404).json({ success: false, error: 'Media file not found or expired.' });
      return;
    }

    const contentType = ALLOWED_MIME_TYPES.has(file.mimeType) ? file.mimeType : 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', file.buffer.length);
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
