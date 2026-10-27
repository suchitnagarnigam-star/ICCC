import express from 'express';
import complaintRoutes from '../routes/complaintRoutes';
import authRoutes from '../routes/authRoutes';
import { getDbPool } from '../config/db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = 4094;
const server = app.listen(PORT, async () => {
  try {
    console.log(`--- Testing Complaint Access, Public Tracking, & Claim Workflow on port ${PORT} ---`);

    // 1. Unauthenticated GET /api/complaints must return 401
    let res = await fetch(`http://localhost:${PORT}/api/complaints`);
    if (res.status !== 401) throw new Error(`Expected 401 for unauthenticated list, got ${res.status}`);
    console.log('✅ 1. Unauthenticated GET /api/complaints blocked with 401.');

    // 2. Unauthenticated GET /api/complaints/:id must return 401
    res = await fetch(`http://localhost:${PORT}/api/complaints/00000000-0000-0000-0000-000000000000`);
    if (res.status !== 401) throw new Error(`Expected 401 for unauthenticated detail, got ${res.status}`);
    console.log('✅ 2. Unauthenticated GET /api/complaints/:id blocked with 401.');

    // 3. Unauthenticated GET /api/complaints/:id/timeline must return 401
    res = await fetch(`http://localhost:${PORT}/api/complaints/00000000-0000-0000-0000-000000000000/timeline`);
    if (res.status !== 401) throw new Error(`Expected 401 for unauthenticated timeline, got ${res.status}`);
    console.log('✅ 3. Unauthenticated GET /api/complaints/:id/timeline blocked with 401.');

    // 4. Anonymous intake submission (public portal) with spoofed citizenId
    res = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complainantName: 'Sunita Sharma',
        contactNumber: '9812300099',
        description: 'Water accumulation in front of House 42, Ward 15',
        wardNumber: 15,
        categoryId: '3',
        citizenId: '00000000-0000-0000-0000-000000000000', // Attempted spoof
      }),
    });
    const createdJson = await res.json();
    if (res.status !== 201) throw new Error(`Complaint creation failed: ${JSON.stringify(createdJson)}`);
    const createdComplaint = createdJson.data;
    console.log(`✅ 4. Grievance registered: ${createdComplaint.complaintNumber}`);

    // Verify spoofed citizenId was rejected in DB
    const pool = getDbPool();
    const dbComp = await pool.query<{ citizen_id: string | null; is_unclaimed: boolean }>(
      'SELECT citizen_id, is_unclaimed FROM complaints WHERE id = $1',
      [createdComplaint.id]
    );
    if (dbComp.rows[0].citizen_id !== null || !dbComp.rows[0].is_unclaimed) {
      throw new Error(`Citizen ID spoofing check failed! citizen_id: ${dbComp.rows[0].citizen_id}, is_unclaimed: ${dbComp.rows[0].is_unclaimed}`);
    }
    console.log('✅ 5. Spoofed citizenId discarded; grievance safely marked is_unclaimed = true.');

    // 5. Public tracking route test: exact complaintNumber + phone
    res = await fetch(`http://localhost:${PORT}/api/complaints/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaintNumber: createdComplaint.complaintNumber,
        contactNumber: '9812300099',
      }),
    });
    const trackJson = await res.json();
    if (res.status !== 200 || !trackJson.success) {
      throw new Error(`Tracking failed: ${JSON.stringify(trackJson)}`);
    }
    // Verify privacy sanitization (no phone numbers or PII)
    if (trackJson.data.contactNumber || trackJson.data.complainantName || trackJson.data.assignedJePhone) {
      throw new Error('Privacy violation: tracking endpoint leaked citizen or staff PII!');
    }
    console.log('✅ 6. Public tracking succeeded with sanitized civic response (zero PII leakage).');

    // 6. Register citizen account with phone 9812300099
    const regRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunita Sharma',
        phoneNumber: '9812300099',
        pin: '4321',
      }),
    });
    let citizenToken = '';
    if (regRes.status === 201) {
      const regData = await regRes.json();
      citizenToken = regData.token;
    } else {
      const loginRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9812300099', pin: '4321' }),
      });
      const loginData = await loginRes.json();
      citizenToken = loginData.token;
    }

    // Verify citizen phone via OTP
    const otpRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9812300099' }),
    });
    const otpData = await otpRes.json();
    await fetch(`http://localhost:${PORT}/api/auth/citizen/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ phoneNumber: '9812300099', otp: otpData.debugOtp }),
    });

    // Re-login to get updated JWT with verified status
    const reloginRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9812300099', pin: '4321' }),
    });
    citizenToken = (await reloginRes.json()).token;

    // 7. Authenticated citizen claims their unclaimed grievance
    res = await fetch(`http://localhost:${PORT}/api/complaints/${createdComplaint.id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
    });
    const claimJson = await res.json();
    if (res.status !== 200 || !claimJson.success) {
      throw new Error(`Claim failed: ${JSON.stringify(claimJson)}`);
    }
    console.log('✅ 7. Authenticated citizen successfully claimed grievance via verified phone match.');

    // 8. Authenticated citizen can now view complaint details
    res = await fetch(`http://localhost:${PORT}/api/complaints/${createdComplaint.id}`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    if (res.status !== 200) throw new Error(`Citizen access failed: ${res.status}`);
    console.log('✅ 8. Owner citizen authorized to read complaint detail.');

    // 9. Unrelated citizen (e.g. 9888897201 as citizen or another phone) gets 403
    const strangerReg = await fetch(`http://localhost:${PORT}/api/auth/citizen/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stranger Singh',
        phoneNumber: '9877700011',
        pin: '9988',
      }),
    });
    let strangerToken = '';
    if (strangerReg.status === 201) {
      strangerToken = (await strangerReg.json()).token;
    } else {
      const lRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9877700011', pin: '9988' }),
      });
      strangerToken = (await lRes.json()).token;
    }

    res = await fetch(`http://localhost:${PORT}/api/complaints/${createdComplaint.id}`, {
      headers: { Authorization: `Bearer ${strangerToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 for stranger citizen, got ${res.status}`);
    console.log('✅ 9. Non-owner citizen correctly blocked with 403 Forbidden.');

    console.log('🎉 ALL COMPLAINT ACCESS, TRACKING, AND IDENTITY CLAIMS VERIFIED!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
});

