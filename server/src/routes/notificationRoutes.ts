import { Router, Request, Response } from 'express';
import { authenticateToken, requireRoles } from '../middleware/auth';
import { getDbPool } from '../config/db';
import { processNotificationOutboxBatch } from '../workers/notificationWorker';

const router = Router();

/**
 * GET /api/notifications
 * In-app notification inbox with unread count for the authenticated user.
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getDbPool();
    const userId = req.user!.userId;

    const notifsRes = await pool.query<any>(
      `SELECT * FROM in_app_notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    const countRes = await pool.query<{ count: string }>(
      `SELECT count(*) FROM in_app_notifications 
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    res.json({
      success: true,
      unreadCount: parseInt(countRes.rows[0].count, 10),
      data: notifsRes.rows,
    });
  } catch (error: any) {
    console.error('[NotificationRoutes] Error fetching inbox:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single in-app notification as read.
 */
router.patch('/:id/read', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getDbPool();
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await pool.query(
      `UPDATE in_app_notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Notification not found.' });
      return;
    }

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    console.error('[NotificationRoutes] Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all in-app notifications as read for current user.
 */
router.patch('/read-all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getDbPool();
    const userId = req.user!.userId;

    await pool.query(
      `UPDATE in_app_notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    console.error('[NotificationRoutes] Error marking all read:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all notifications read.' });
  }
});

/**
 * POST /api/notifications/subscribe
 * Register Web Push subscription credentials.
 */
router.post('/subscribe', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getDbPool();
    const userId = req.user!.userId;
    const { endpoint, keys, userAgent } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ success: false, error: 'Valid push subscription endpoint and keys are required.' });
      return;
    }

    const existing = await pool.query<{ id: string }>(
      'SELECT id FROM push_subscriptions WHERE endpoint = $1 LIMIT 1',
      [endpoint]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `UPDATE push_subscriptions 
         SET user_id = $1, p256dh = $2, auth = $3, user_agent = COALESCE($4, user_agent), is_active = TRUE, updated_at = NOW() 
         WHERE endpoint = $5`,
        [userId, keys.p256dh, keys.auth, userAgent || null, endpoint]
      );
    } else {
      await pool.query(
        `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, NOW())`,
        [userId, endpoint, keys.p256dh, keys.auth, userAgent || null]
      );
    }

    res.status(201).json({ success: true, message: 'Push subscription registered.' });
  } catch (error: any) {
    console.error('[NotificationRoutes] Error registering push subscription:', error);
    res.status(500).json({ success: false, error: 'Failed to register push subscription.' });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Revoke Web Push subscription.
 */
router.post('/unsubscribe', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = getDbPool();
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({ success: false, error: 'Endpoint is required to unsubscribe.' });
      return;
    }

    await pool.query(
      `UPDATE push_subscriptions SET is_active = FALSE, updated_at = NOW() WHERE endpoint = $1`,
      [endpoint]
    );

    res.json({ success: true, message: 'Push subscription deactivated.' });
  } catch (error: any) {
    console.error('[NotificationRoutes] Error unsubscribing:', error);
    res.status(500).json({ success: false, error: 'Failed to revoke push subscription.' });
  }
});

/**
 * POST /api/notifications/process-outbox
 * Trigger immediate transactional outbox worker batch.
 * Restricted to administrators and command center operators.
 */
router.post(
  '/process-outbox',
  authenticateToken,
  requireRoles(['admin', 'operator']),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await processNotificationOutboxBatch();
      res.json({ success: true, message: 'Outbox processed.', ...result });
    } catch (error: any) {
      console.error('[NotificationRoutes] Outbox trigger error:', error);
      res.status(500).json({ success: false, error: 'Failed to process outbox.' });
    }
  }
);

export default router;
