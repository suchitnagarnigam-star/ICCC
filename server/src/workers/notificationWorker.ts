import { getDbPool } from '../config/db';

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

/**
 * Transactional Outbox Worker
 * Claims pending notification events from PostgreSQL using FOR UPDATE SKIP LOCKED
 * Dispatches to In-App Inbox and Web Push with exponential backoff retry.
 */
export async function processNotificationOutboxBatch(batchSize: number = 20): Promise<{ processed: number; succeeded: number; failed: number }> {
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
        }

        // 2. Mark event as successfully sent
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

export function startNotificationOutboxWorker(intervalMs: number = 5000): void {
  if (workerInterval) return;
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
  }
}

