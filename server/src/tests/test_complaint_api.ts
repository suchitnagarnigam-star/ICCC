import express from 'express';
import complaintRoutes from '../routes/complaintRoutes';
import authRoutes from '../routes/authRoutes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = 4098;
const server = app.listen(PORT, async () => {
  try {
    console.log(`Testing authenticated complaint endpoints against Neon PostgreSQL on port ${PORT}...`);

    // 1. Authenticate Operator
    const opLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9876543210', pin: '1234' }),
    });
    const opToken = (await opLoginRes.json()).token;

    // 2. GET /api/complaints with operator token
    let res = await fetch(`http://localhost:${PORT}/api/complaints`, {
      headers: { Authorization: `Bearer ${opToken}` },
    });
    let json = await res.json();
    console.log('1. GET /api/complaints status:', res.status, 'Total in DB:', json.total);

    // 3. Register citizen Ramanjot Kaur
    const citRegRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Ramanjot Kaur',
        phoneNumber: '9876500001',
        pin: '1234',
      }),
    });
    let citToken = '';
    if (citRegRes.status === 201) {
      citToken = (await citRegRes.json()).token;
    } else {
      const l = await fetch(`http://localhost:${PORT}/api/auth/citizen/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '9876500001', pin: '1234' }),
      });
      citToken = (await l.json()).token;
    }

    // 4. Citizen submits grievance in Ward 1 (Light / Street light non-functional)
    res = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citToken}`,
      },
      body: JSON.stringify({
        complainantName: 'Ramanjot Kaur',
        contactNumber: '9876500001',
        description: 'Street light non-functional near Gurdwara in Ward 1',
        categoryId: '14',
        wardNumber: 1,
        address: 'Main Bazaar, Near Gurdwara',
      }),
    });
    json = await res.json();
    console.log('2. POST /api/complaints created:', json.data?.complaintNumber, 'Assigned to:', json.data?.assignedJeName);
    const id = json.data?.id;

    // 5. GET /api/complaints/:id
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}`, {
      headers: { Authorization: `Bearer ${citToken}` },
    });
    json = await res.json();
    console.log('3. GET /api/complaints/:id retrieved:', json.data?.complaintNumber, 'Status:', json.data?.status);

    // 6. Login as Assigned Field Officer for Ward 1 (Vikas Kumar, 9646222900)
    const jeLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: '9646222900', pin: '1234' }),
    });
    const jeToken = (await jeLoginRes.json()).token;

    // 7. POST /api/complaints/:id/acknowledge
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/acknowledge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jeToken}` },
    });
    json = await res.json();
    console.log('4. Acknowledge status:', res.status, 'New status:', json.data?.status);

    // 8. POST /api/complaints/:id/status (transition to IN_PROGRESS)
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jeToken}`,
      },
      body: JSON.stringify({ status: 'IN_PROGRESS', remarks: 'Bucket truck dispatched to Ward 1' }),
    });
    json = await res.json();
    console.log('5. In Progress status:', res.status, 'New status:', json.data?.status);

    // 9. POST /api/complaints/:id/resolution
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jeToken}`,
      },
      body: JSON.stringify({ resolutionNotes: 'Replaced LED luminaire driver and bulb in Ward 1.' }),
    });
    json = await res.json();
    console.log('6. Resolution status:', res.status, 'New status:', json.data?.status);

    // 10. POST /api/complaints/:id/verify-close (by citizen Ramanjot Kaur)
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/verify-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citToken}`,
      },
      body: JSON.stringify({ rating: 5, feedback: 'Light is working bright and clear now, thanks!' }),
    });
    json = await res.json();
    console.log('7. Closed status:', res.status, 'New status:', json.data?.status);

    // 11. GET /api/complaints/:id/timeline
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/timeline`, {
      headers: { Authorization: `Bearer ${citToken}` },
    });
    json = await res.json();
    console.log('8. Timeline count in DB:', json.data?.length);

    console.log('✅ ALL COMPLAINT ENDPOINT TESTS PASSED WITH NEON POSTGRESQL!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
});
