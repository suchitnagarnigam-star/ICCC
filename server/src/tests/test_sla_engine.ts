import { calculateWorkingHourDeadline, isWorkingDay, GAZETTED_HOLIDAYS_2026 } from '../services/slaService';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import complaintRoutes from '../routes/complaintRoutes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

async function testSlaCalculations() {
  console.log('--- 1. Testing SLA Mathematical Invariants ---');

  // Test Case A: Monday 09:00 IST start (2026-05-04 is a Monday, not a holiday)
  // 48 working hours = 6 full 8-hour working days:
  // Day 1: Mon May 4 (8h)
  // Day 2: Tue May 5 (8h)
  // Day 3: Wed May 6 (8h)
  // Day 4: Thu May 7 (8h)
  // Day 5: Fri May 8 (8h)
  // Sat May 9 (SKIPPED - Weekend)
  // Sun May 10 (SKIPPED - Weekend)
  // Day 6: Mon May 11 (8h) -> Should finish at 17:00 IST on Mon May 11!
  const mondayStartUtc = new Date(Date.UTC(2026, 4, 4, 3, 30)); // 09:00 IST
  const mondayDue = calculateWorkingHourDeadline(mondayStartUtc, 48);
  const istOffsetMs = 330 * 60 * 1000;
  const mondayDueIst = new Date(mondayDue.getTime() + istOffsetMs);

  console.log('Monday 09:00 IST + 48 Working Hours ->', mondayDueIst.toISOString().replace('Z', ' IST'));
  if (mondayDueIst.getUTCDate() !== 11 || mondayDueIst.getUTCHours() !== 17) {
    throw new Error(`SLA calculation failed: Expected 2026-05-11 17:00 IST, got ${mondayDueIst.toISOString()}`);
  }
  console.log('✅ Monday start correctly skipped weekend and finished at Monday 17:00 IST (6 working days)!');

  // Test Case B: Gazetted Holiday Exclusion
  // 2026-01-26 is Republic Day (Monday).
  // A complaint submitted Friday Jan 23 at 17:00 IST:
  // Sat Jan 24 (SKIPPED - Weekend)
  // Sun Jan 25 (SKIPPED - Weekend)
  // Mon Jan 26 (SKIPPED - Republic Day Holiday)
  // Clock starts Tue Jan 27 09:00 IST!
  const fridayCloseUtc = new Date(Date.UTC(2026, 0, 23, 11, 30)); // 17:00 IST Friday Jan 23
  const holidayDue = calculateWorkingHourDeadline(fridayCloseUtc, 8); // 8 working hours = 1 full day
  const holidayDueIst = new Date(holidayDue.getTime() + istOffsetMs);
  console.log('Friday Jan 23 17:00 IST + 8 Working Hours (skipping Republic Day) ->', holidayDueIst.toISOString().replace('Z', ' IST'));
  if (holidayDueIst.getUTCDate() !== 27 || holidayDueIst.getUTCHours() !== 17) {
    throw new Error(`Holiday exclusion failed: Expected 2026-01-27 17:00 IST, got ${holidayDueIst.toISOString()}`);
  }
  console.log('✅ Gazetted holiday (Republic Day) correctly excluded!');
}

async function testPauseResumeEndpoints() {
  console.log('\n--- 2. Testing Pause & Resume Endpoints against Database ---');

  const PORT = 4096;
  const server = app.listen(PORT, async () => {
    try {
      // 1. Login as Ward 1 JE (Vikas Kumar, 9646222900, PIN: 1234)
      const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9646222900', pin: '1234' }),
      });
      const loginJson = await loginRes.json();
      const token = loginJson.token;

      // 2. Create complaint in Ward 1
      const compRes = await fetch(`http://localhost:${PORT}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          complainantName: 'Sunita Sharma',
          contactNumber: '9815011223',
          description: 'Sewer manhole cover cracked',
          categoryId: 'cat_03',
          wardNumber: 1,
          address: 'Main Chowk, Ward 1',
        }),
      });
      const compJson = await compRes.json();
      const complaintId = compJson.data?.id;
      const initialDueAt = compJson.data?.dueAt;
      console.log('Created Complaint:', compJson.data?.complaintNumber, 'Initial DueAt:', initialDueAt);

      // 3. Pause SLA Clock
      const pauseRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Waiting for custom ductile iron manhole casting delivery' }),
      });
      const pauseJson = await pauseRes.json();
      console.log('Pause status:', pauseRes.status, 'Is Paused in DB:', pauseJson.data?.isPaused);
      if (!pauseJson.data?.isPaused) throw new Error('Complaint was not marked as paused in DB.');

      // 4. Resume SLA Clock
      const resumeRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const resumeJson = await resumeRes.json();
      console.log('Resume status:', resumeRes.status, 'Is Paused in DB:', resumeJson.data?.isPaused);
      console.log('Adjusted DueAt:', resumeJson.data?.dueAt, 'Total Paused Minutes:', resumeJson.data?.totalPausedMinutes);
      if (resumeJson.data?.isPaused) throw new Error('Complaint is still paused.');

      console.log('✅ ALL SLA CALCULATION AND PAUSE/RESUME AUDIT GATES PASSED!');
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test failed:', err);
      server.close();
      process.exit(1);
    }
  });
}

testSlaCalculations()
  .then(() => testPauseResumeEndpoints())
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
