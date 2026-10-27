import express from 'express';
import complaintRoutes from '../routes/complaintRoutes';
import authRoutes from '../routes/authRoutes';
import { getDbPool } from '../config/db';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = 4098;
const server = app.listen(PORT, async () => {
  try {
    console.log(`================================================================`);
    console.log(`🛡️  MCL ICCC Comprehensive API Verification Test Suite (Port ${PORT})`);
    console.log(`================================================================`);

    const pool = getDbPool();

    // -------------------------------------------------------------
    // 1. Unauthenticated Route Guards
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Unauthenticated Route Protection ---');
    let res = await fetch(`http://localhost:${PORT}/api/complaints`);
    if (res.status !== 401) throw new Error(`Expected 401 for unauthenticated GET /api/complaints, got ${res.status}`);
    console.log('✅ GET /api/complaints blocked without token (HTTP 401)');

    res = await fetch(`http://localhost:${PORT}/api/complaints/00000000-0000-0000-0000-000000000000`);
    if (res.status !== 401) throw new Error(`Expected 401 for unauthenticated GET /:id, got ${res.status}`);
    console.log('✅ GET /api/complaints/:id blocked without token (HTTP 401)');

    res = await fetch(`http://localhost:${PORT}/api/complaints/00000000-0000-0000-0000-000000000000/timeline`);
    if (res.status !== 401) throw new Error(`Expected 401 for unauthenticated GET /:id/timeline, got ${res.status}`);
    console.log('✅ GET /api/complaints/:id/timeline blocked without token (HTTP 401)');

    // -------------------------------------------------------------
    // 2. Staff Authentication & Atomic Concurrent Submissions
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Operator Login & Atomic Sequential Numbering ---');
    const opLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9876543210', pin: '1234' }),
    });
    if (opLoginRes.status !== 200) throw new Error(`Operator login failed: ${opLoginRes.status}`);
    const opToken = (await opLoginRes.json()).token;
    console.log('✅ Desk operator logged in successfully (HTTP 200)');

    // Test concurrent submissions for race conditions
    console.log('⚡ Launching 5 concurrent complaint submissions to verify atomic sequence numbering...');
    const concurrentSubmissions = await Promise.all(
      [1, 2, 3, 4, 5].map((i) =>
        fetch(`http://localhost:${PORT}/api/complaints`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${opToken}`,
          },
          body: JSON.stringify({
            complainantName: `Concurrent Test User ${i}`,
            contactNumber: `98765432${i}0`,
            description: `Concurrent civic issue report ${i}`,
            categoryId: '1',
            wardNumber: i,
            address: `Test Street ${i}`,
          }),
        }).then((r) => r.json())
      )
    );

    const generatedNumbers = concurrentSubmissions.map((s) => s.data?.complaintNumber);
    const uniqueNumbers = new Set(generatedNumbers);
    if (uniqueNumbers.size !== 5) {
      throw new Error(`Collision detected in concurrent complaint numbering: ${JSON.stringify(generatedNumbers)}`);
    }
    const currentYear = new Date().getFullYear();
    for (const num of generatedNumbers) {
      if (!num || !num.startsWith(`MCL-${currentYear}-`)) {
        throw new Error(`Invalid complaint number format: ${num}`);
      }
    }
    console.log(`✅ 5 concurrent complaints created atomically: ${generatedNumbers.join(', ')}`);

    // -------------------------------------------------------------
    // 3. Citizen Registration & Mandatory Phone Verification
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Citizen Phone Verification & Claim Guard ---');
    const testCitizenPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);

    // Register citizen WITHOUT OTP -> is_phone_verified must be false
    const regRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Harpreet Singh',
        phoneNumber: testCitizenPhone,
        pin: '1234',
      }),
    });
    if (regRes.status !== 201) throw new Error(`Registration failed: ${regRes.status}`);
    const regData = await regRes.json();
    const citizenToken = regData.token;
    if (regData.user.isPhoneVerified) {
      throw new Error('Citizen was marked verified without OTP confirmation!');
    }
    console.log('✅ Citizen registered in unverified state (isPhoneVerified: false)');

    // Create an anonymous/unclaimed grievance matching this citizen's phone
    const anonRes = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complainantName: 'Harpreet Singh',
        contactNumber: testCitizenPhone,
        description: 'Broken water valve causing leak on Gill Road',
        categoryId: 'cat_03',
        wardNumber: 1,
        address: 'Gill Road, Ward 1',
      }),
    });
    if (anonRes.status !== 201) throw new Error(`Anonymous grievance creation failed: ${anonRes.status}`);
    const unclaimedComplaint = (await anonRes.json()).data;
    console.log(`✅ Anonymous grievance created: ${unclaimedComplaint.complaintNumber} (is_unclaimed: true)`);

    // Attempt to claim with UNVERIFIED phone -> MUST FAIL with 400/403
    let claimRes = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    if (claimRes.status !== 400 && claimRes.status !== 403) {
      throw new Error(`Expected 400/403 for unverified citizen claim, got ${claimRes.status}`);
    }
    const claimErr = await claimRes.json();
    if (!claimErr.error?.includes('Phone ownership verification required')) {
      throw new Error(`Unexpected claim error message: ${JSON.stringify(claimErr)}`);
    }
    console.log('✅ Unverified citizen blocked from claiming grievance (HTTP 400/403)');

    // Request OTP via /citizen/send-otp
    const otpRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: testCitizenPhone }),
    });
    if (otpRes.status !== 200) throw new Error(`Send OTP failed: ${otpRes.status}`);
    const otpData = await otpRes.json();
    const receivedOtp = otpData.debugOtp;
    if (!receivedOtp) throw new Error('Debug OTP not returned in dev mode!');
    console.log(`✅ OTP requested and received: ${receivedOtp}`);

    // Verify OTP via /citizen/verify-otp
    const verifyOtpRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: testCitizenPhone, otp: receivedOtp }),
    });
    if (verifyOtpRes.status !== 200) throw new Error(`Verify OTP failed: ${verifyOtpRes.status}`);
    console.log('✅ OTP verified successfully; user phone confirmed');

    // Claim complaint again -> MUST SUCCEED
    claimRes = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    if (claimRes.status !== 200) throw new Error(`Verified citizen claim failed: ${claimRes.status}`);
    console.log('✅ Verified citizen claimed grievance successfully (HTTP 200)');

    // Verify DB state
    const claimedCheck = await pool.query<any>(
      'SELECT citizen_id, is_unclaimed FROM complaints WHERE id = $1',
      [unclaimedComplaint.id]
    );
    if (claimedCheck.rows[0].is_unclaimed || !claimedCheck.rows[0].citizen_id) {
      throw new Error('Database is_unclaimed not cleared after valid claim!');
    }
    console.log('✅ Database state reconciled: is_unclaimed = false, citizen_id bound');

    // -------------------------------------------------------------
    // 4. Public Sanitized Grievance Tracking Route
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Public Tracking Endpoint ---');
    // Missing fields
    let trackRes = await fetch(`http://localhost:${PORT}/api/complaints/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (trackRes.status !== 400) throw new Error(`Expected 400 for empty track request, got ${trackRes.status}`);
    console.log('✅ Empty track request rejected with HTTP 400');

    // Mismatched phone number
    trackRes = await fetch(`http://localhost:${PORT}/api/complaints/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaintNumber: unclaimedComplaint.complaintNumber,
        contactNumber: '9999999999',
      }),
    });
    if (trackRes.status !== 404) throw new Error(`Expected 404 for mismatched phone track, got ${trackRes.status}`);
    console.log('✅ Mismatched phone tracking rejected with HTTP 404');

    // Valid tracking
    trackRes = await fetch(`http://localhost:${PORT}/api/complaints/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaintNumber: unclaimedComplaint.complaintNumber,
        contactNumber: testCitizenPhone,
      }),
    });
    if (trackRes.status !== 200) throw new Error(`Valid tracking failed: ${trackRes.status}`);
    const trackData = await trackRes.json();
    if (trackData.data.contactNumber || trackData.data.complainantName || trackData.data.assignedJePhone) {
      throw new Error('Privacy breach: Public tracking exposed PII!');
    }
    console.log('✅ Public tracking returned sanitized civic data without PII');

    // -------------------------------------------------------------
    // 5. Field Officer Workflow & Mandatory Resolution Proof
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Field Resolution Proof Enforcement ---');
    // Login as Field JE for Ward 1 (Vikas Kumar, 9646222900)
    const jeLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9646222900', pin: '1234' }),
    });
    if (jeLoginRes.status !== 200) throw new Error(`JE login failed: ${jeLoginRes.status}`);
    const jeToken = (await jeLoginRes.json()).token;

    // Acknowledge complaint
    const ackRes = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/acknowledge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jeToken}` },
    });
    if (ackRes.status !== 200) throw new Error(`JE acknowledge failed: ${ackRes.status}`);
    console.log('✅ Assigned Field JE acknowledged grievance (HTTP 200)');

    // Attempt resolution with NO files -> MUST FAIL with HTTP 400
    let resSubmit = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jeToken}`,
      },
      body: JSON.stringify({ resolutionNotes: 'Fixed the valve without photo' }),
    });
    if (resSubmit.status !== 400) {
      throw new Error(`Expected 400 when submitting resolution with zero evidence files, got ${resSubmit.status}`);
    }
    const noFileErr = await resSubmit.json();
    if (!noFileErr.error?.includes('requires at least one photographic evidence file')) {
      throw new Error(`Unexpected error message for empty proof: ${JSON.stringify(noFileErr)}`);
    }
    console.log('✅ Resolution without photographic proof strictly rejected (HTTP 400)');

    // Attempt resolution with INVALID MIME type (text file) -> MUST FAIL with HTTP 400
    const invalidForm = new FormData();
    invalidForm.append('notes', 'Fixed the pipe');
    invalidForm.append(
      'resolutionProof',
      new Blob(['not an image content'], { type: 'text/plain' }),
      'proof.txt'
    );
    resSubmit = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/resolution`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jeToken}` },
      body: invalidForm,
    });
    if (resSubmit.status !== 400) {
      throw new Error(`Expected 400 for non-image proof upload, got ${resSubmit.status}`);
    }
    console.log('✅ Resolution with non-image proof rejected (HTTP 400)');

    // Submit valid resolution with multipart JPEG image
    const validForm = new FormData();
    validForm.append('notes', 'Replaced cracked 2-inch sluice valve and restored normal water pressure.');
    validForm.append(
      'resolutionProof',
      new Blob(['\xFF\xD8\xFF\xE0\x00\x10JFIF' + 'mock-jpeg-bytes'], { type: 'image/jpeg' }),
      'valve_repaired.jpg'
    );
    resSubmit = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/resolution`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jeToken}` },
      body: validForm,
    });
    if (resSubmit.status !== 200) {
      const errText = await resSubmit.text();
      throw new Error(`Valid resolution submission failed (HTTP ${resSubmit.status}): ${errText}`);
    }
    const resData = await resSubmit.json();
    if (resData.data.status !== 'RESOLUTION_SUBMITTED') {
      throw new Error(`Status was not transitioned to RESOLUTION_SUBMITTED: ${resData.data.status}`);
    }
    console.log('✅ Resolution submitted successfully with verified photographic proof (HTTP 200)');

    // Verify DB media records
    const mediaCheck = await pool.query<any>(
      "SELECT * FROM complaint_media WHERE complaint_id = $1 AND purpose = 'resolution'",
      [unclaimedComplaint.id]
    );
    if (mediaCheck.rows.length === 0) {
      throw new Error('Resolution media record was not inserted into database!');
    }
    console.log(`✅ Resolution evidence record verified in database (${mediaCheck.rows.length} file registered)`);

    // -------------------------------------------------------------
    // 6. Explicit Closure Verdict Validation
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Explicit Closure Verdict Enforcement ---');
    // Missing verdict
    let closeRes = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/verify-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ feedback: 'No verdict provided' }),
    });
    if (closeRes.status !== 400) throw new Error(`Expected 400 for omitted verdict, got ${closeRes.status}`);
    console.log('✅ Omitted verdict rejected with HTTP 400');

    // Invalid verdict (e.g. 'approved' or 'yes')
    closeRes = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/verify-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ verdict: 'approved', feedback: 'Looks good' }),
    });
    if (closeRes.status !== 400) throw new Error(`Expected 400 for invalid verdict 'approved', got ${closeRes.status}`);
    console.log("✅ Invalid verdict ('approved') rejected with HTTP 400");

    // Explicit accepted verdict
    closeRes = await fetch(`http://localhost:${PORT}/api/complaints/${unclaimedComplaint.id}/verify-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ verdict: 'accepted', rating: 5, feedback: 'Leak is completely stopped, thank you!' }),
    });
    if (closeRes.status !== 200) throw new Error(`Valid closure failed: ${closeRes.status}`);
    const closeData = await closeRes.json();
    if (closeData.data.status !== 'CLOSED') {
      throw new Error(`Expected status CLOSED, got ${closeData.data.status}`);
    }
    console.log('✅ Grievance verified and permanently closed with explicit accepted verdict (HTTP 200)');

    // Verify DB closure state
    const dbFinal = await pool.query<any>(
      'SELECT current_status, closed_at FROM complaints WHERE id = $1',
      [unclaimedComplaint.id]
    );
    if (dbFinal.rows[0].current_status !== 'CLOSED' || !dbFinal.rows[0].closed_at) {
      throw new Error('Database final state is not CLOSED with closed_at timestamp!');
    }
    console.log('✅ Database final state reconciled: current_status = CLOSED, closed_at timestamp populated');

    // -------------------------------------------------------------
    // 7. Fail-Closed Supervisor Scope Tests
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Fail-Closed Supervisor Scope ---');
    // Login as SDO with branch 'O&M' (Anshul Garcha, 9815144612)
    const sdoLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9815144612', pin: '1234' }),
    });
    if (sdoLogin.status !== 200) throw new Error(`SDO login failed: ${sdoLogin.status}`);
    const sdoToken = (await sdoLogin.json()).token;

    // Create a complaint in 'Light' branch
    const lightCompRes = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${opToken}`,
      },
      body: JSON.stringify({
        complainantName: 'Scope Test User',
        contactNumber: '9800011122',
        description: 'Dark street light pole',
        categoryId: 'cat_14', // Light branch
        wardNumber: 2,
        address: 'Sector 32, Ward 2',
      }),
    });
    const lightComp = (await lightCompRes.json()).data;

    // SDO (O&M) attempts to read or modify Light complaint -> MUST BE FORBIDDEN (403)
    const sdoReadRes = await fetch(`http://localhost:${PORT}/api/complaints/${lightComp.id}`, {
      headers: { Authorization: `Bearer ${sdoToken}` },
    });
    if (sdoReadRes.status !== 403) {
      throw new Error(`Expected 403 when O&M supervisor accesses Light complaint, got ${sdoReadRes.status}`);
    }
    console.log('✅ Cross-department supervisor access blocked (HTTP 403 fail-closed)');

    console.log('\n================================================================');
    console.log('🎉 ALL RIGOROUS ASSERTIONS AND NEGATIVE SECURITY GATES PASSED!');
    console.log('================================================================');
    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ TEST SUITE FAILED WITH ERROR:', err.message || err);
    server.close();
    process.exit(1);
  }
});
