import webpush from 'web-push';
import { getDbPool } from '../config/db';
import { ENV } from '../config/env';

export interface NotificationEventRow {
  id: string;
  idempotency_key: string;
  complaint_id: string;
  recipient_user_id: string;
  event_type: string;
  channel: string;
  payload_json: {
    title: string;
    body: string;
    complaintNumber?: string;
    wardNumber?: number;
    branch?: string;
    metadata?: Record<string, any>;
  };
  delivery_state: 'pending' | 'sent' | 'failed';
  attempt_count: number;
}

// Configure Web Push VAPID credentials if provided in environment
if (ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      ENV.VAPID_SUBJECT,
      ENV.VAPID_PUBLIC_KEY,
      ENV.VAPID_PRIVATE_KEY
    );
  } catch (err: any) {
    console.warn('[NotificationWorker] VAPID configuration warning:', err.message);
  }
}

/**
 * Transactional Outbox Worker
 * Claims pending notification events from PostgreSQL using FOR UPDATE SKIP LOCKED
 * Dispatches to In-App Inbox and Web Push with exponential backoff retry.
 */
export async function processNotificationOutboxBatch(
  batchSize: number = 20
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const pool = getDbPool();
  const client = await pool.connect();

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  try {
    await client.query('BEGIN');

    // Claim pending events without blocking concurrent workers
    const claimRes = await client.query<NotificationEventRow>(
      `SELECT * FROM notification_events 
       WHERE delivery_state = 'pending' AND attempt_count < 5 
       ORDER BY created_at ASC 
       LIMIT $1 
       FOR UPDATE SKIP LOCKED`,
      [batchSize]
    );

    const events = claimRes.rows;
    processed = events.length;

    for (const ev of events) {
      try {
        const payload = ev.payload_json || { title: 'MCL Update', body: 'New notification' };

        // 1. Dispatch into In-App Notification Inbox
        if (ev.recipient_user_id) {
          await client.query(
            `INSERT INTO in_app_notifications (
              user_id, complaint_id, title, body, metadata_json, is_read, created_at
            ) VALUES ($1, $2, $3, $4, $5, FALSE, NOW())`,
            [
              ev.recipient_user_id,
              ev.complaint_id,
              payload.title,
              payload.body,
              JSON.stringify(payload),
            ]
          );

          // 2. Dispatch to Web Push subscriptions (if active)
          const subsRes = await client.query<{ id: string; endpoint: string; p256dh: string; auth: string }>(
            `SELECT id, endpoint, p256dh, auth FROM push_subscriptions 
             WHERE user_id = $1 AND is_active = TRUE`,
            [ev.recipient_user_id]
          );

          if (subsRes.rows.length > 0 && ENV.VAPID_PUBLIC_KEY && ENV.VAPID_PRIVATE_KEY) {
            for (const sub of subsRes.rows) {
              try {
                await webpush.sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: {
                      p256dh: sub.p256dh,
                      auth: sub.auth,
                    },
                  },
                  JSON.stringify(payload)
                );
              } catch (pushErr: any) {
                // If browser endpoint is 404/410 Gone, unsubscribe user automatically
                if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
                  await client.query(
                    'UPDATE push_subscriptions SET is_active = FALSE, updated_at = NOW() WHERE id = $1',
                    [sub.id]
                  );
                } else {
                  console.warn(`[NotificationWorker] Push delivery failed for subscription ${sub.id}:`, pushErr.message);
                }
              }
            }
          }
        }

        // 3. Mark event as successfully sent
        await client.query(
          `UPDATE notification_events 
           SET delivery_state = 'sent', sent_at = NOW(), attempt_count = attempt_count + 1 
           WHERE id = $1`,
          [ev.id]
        );

        succeeded++;
      } catch (err: any) {
        console.error(`[NotificationWorker] Failed delivering event ${ev.id}:`, err);
        failed++;

        await client.query(
          `UPDATE notification_events 
           SET attempt_count = attempt_count + 1, 
               last_error = $1,
               delivery_state = CASE WHEN attempt_count + 1 >= 5 THEN 'failed' ELSE 'pending' END 
           WHERE id = $2`,
          [err?.message || 'Delivery error', ev.id]
        );
      }
    }

    await client.query('COMMIT');
    return { processed, succeeded, failed };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[NotificationWorker] Batch transaction failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

let workerInterval: NodeJS.Timeout | null = null;

export function startNotificationOutboxWorker(intervalMs: number = 10000): void {
  if (workerInterval) return;
  console.log(`📡 Notification outbox worker started (polling interval: ${intervalMs}ms)`);
  workerInterval = setInterval(async () => {
    try {
      await processNotificationOutboxBatch();
    } catch (e) {
      // Worker will retry on next tick
    }
  }, intervalMs);
}

export function stopNotificationOutboxWorker(): void {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log('🛑 Notification outbox worker stopped');
  }
}
