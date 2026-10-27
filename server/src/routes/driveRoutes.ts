import { Router, Request, Response } from 'express';
import { getDriveFileBuffer } from '../services/driveService';

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
 * Streams a Google Drive or locally cached file with HTTP caching.
 */
router.get('/files/:fileId', async (req: Request, res: Response): Promise<void> => {
  const rawId = req.params.fileId;
  const fileId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!fileId || typeof fileId !== 'string' || !/^[a-zA-Z0-9_-]{10,100}$/.test(fileId)) {
    res.status(400).json({ success: false, error: 'Invalid file ID format.' });
    return;
  }

  // ETag / conditional request validation
  const clientEtag = req.headers['if-none-match'];
  if (clientEtag && clientEtag === `"${fileId}"`) {
    res.status(304).end();
    return;
  }

  try {
    const file = await getDriveFileBuffer(fileId);

    if (!file) {
      res.status(404).json({ success: false, error: 'File not found or expired.' });
      return;
    }

    const contentType = ALLOWED_MIME_TYPES.has(file.mimeType) ? file.mimeType : 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', file.buffer.length);
    res.setHeader('ETag', `"${fileId}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    res.status(200).send(file.buffer);
  } catch (error: any) {
    console.error(`[DriveRoute] Error streaming file ${fileId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to stream media file.' });
  }
});

export default router;
