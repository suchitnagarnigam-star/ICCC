import app from '../app';
import { getDbPool } from '../config/db';
import { processNotificationOutboxBatch } from '../workers/notificationWorker';

const PORT = 4095;
const server = app.listen(PORT, async () => {
  try {
    console.log(`Testing Media Security & Notification Delivery on port ${PORT}...`);

    // 1. Staff Login (Ward 1 JE: Vikas Kumar, 9646222900, PIN: 1234)
    const jeRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9646222900', pin: '1234' }),
    });
    const jeJson = await jeRes.json();
    const jeToken = jeJson.token;
    const jeUserId = jeJson.user?.userId;

    // 2. Citizen Login (Harpreet Kaur, 9876599999, PIN: 5678)
    const citRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9876599999', pin: '5678' }),
    });
    const citJson = await citRes.json();
    const citToken = citJson.token;

    // 3. Security: Test Drive Access without Authentication -> Expect 401
    const unauthDriveRes = await fetch(`http://localhost:${PORT}/api/drive/files/mock-img-001`);
    console.log('3. Unauthenticated Drive file access -> Status:', unauthDriveRes.status, '(Expected 401)');
    if (unauthDriveRes.status !== 401) throw new Error('Expected 401 for unauthenticated media access');

    // 4. Create a complaint in Ward 1
    const compRes = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citToken}`,
      },
      body: JSON.stringify({
        complainantName: 'Harpreet Kaur',
        contactNumber: '9876599999',
        description: 'Broken water supply pipe near street 4',
        categoryId: 'cat_07', // O&M Water Supply
        wardNumber: 1,
        address: 'Street 4, Ward 1',
      }),
    });
    const compJson = await compRes.json();
    const complaintId = compJson.data?.id;
    console.log('4. Grievance Created:', compJson.data?.complaintNumber, 'ID:', complaintId);

    // 5. Verify Notification Outbox Event Created in DB
    const pool = getDbPool();
    const outboxRes = await pool.query<any>(
      `SELECT * FROM notification_events WHERE complaint_id = $1`,
      [complaintId]
    );
    console.log('5. Transactional Outbox Event in DB:', outboxRes.rows.length, 'State:', outboxRes.rows[0]?.delivery_state);
    if (outboxRes.rows.length === 0) throw new Error('No outbox notification event created.');

    // 6. Process Transactional Outbox Worker Batch
    const workerResult = await processNotificationOutboxBatch();
    console.log('6. Outbox Worker Processed:', workerResult.processed, 'Succeeded:', workerResult.succeeded);

    // 7. Verify Delivery State Updated to 'sent'
    const updatedOutbox = await pool.query<any>(
      `SELECT * FROM notification_events WHERE complaint_id = $1`,
      [complaintId]
    );
    console.log('7. Updated Outbox State:', updatedOutbox.rows[0]?.delivery_state, 'SentAt:', updatedOutbox.rows[0]?.sent_at);
    if (updatedOutbox.rows[0]?.delivery_state !== 'sent') throw new Error('Event state is not sent.');

    // 8. Recipient JE fetches In-App Notifications
    const notifInboxRes = await fetch(`http://localhost:${PORT}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${jeToken}` },
    });
    const notifInboxJson = await notifInboxRes.json();
    console.log('8. JE In-App Inbox Total:', notifInboxJson.data?.length, 'Unread Count:', notifInboxJson.unreadCount);
    if (notifInboxJson.data?.length === 0) throw new Error('In-app notification was not delivered.');
    const notifId = notifInboxJson.data[0].id;

    // 9. Mark notification as read
    const readRes = await fetch(`http://localhost:${PORT}/api/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${jeToken}` },
    });
    const readJson = await readRes.json();
    console.log('9. Mark Notification Read:', readRes.status, readJson.message);

    // 10. Register Web Push Subscription
    const testEndpoint = 'https://fcm.googleapis.com/fcm/send/test-endpoint-' + Date.now();
    const pushSubRes = await fetch(`http://localhost:${PORT}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jeToken}`,
      },
      body: JSON.stringify({
        endpoint: testEndpoint,
        keys: {
          p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9Q0A',
          auth: 'tBHItJI5svbpez7KI4CCXg',
        },
        userAgent: 'Mozilla/5.0 Chrome/120.0',
      }),
    });
    console.log('10. Push Subscription Registered:', pushSubRes.status);
    if (pushSubRes.status !== 201) throw new Error('Failed to register push subscription.');

    // 11. Revoke Web Push Subscription
    const unsubRes = await fetch(`http://localhost:${PORT}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jeToken}`,
      },
      body: JSON.stringify({ endpoint: testEndpoint }),
    });
    console.log('11. Push Subscription Revoked:', unsubRes.status);
    if (unsubRes.status !== 200) throw new Error('Failed to revoke push subscription.');

    console.log('✅ ALL MEDIA SECURITY & COMPLETE NOTIFICATION SUBSYSTEM GATES PASSED!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
});
