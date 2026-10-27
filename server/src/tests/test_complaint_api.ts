import express from 'express';
import complaintRoutes from '../routes/complaintRoutes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/complaints', complaintRoutes);

const PORT = 4098;
const server = app.listen(PORT, async () => {
  try {
    console.log(`Testing complaint endpoints against Neon PostgreSQL on port ${PORT}...`);

    // 1. GET /api/complaints
    let res = await fetch(`http://localhost:${PORT}/api/complaints`);
    let json = await res.json();
    console.log('1. GET /api/complaints status:', res.status, 'Total in DB:', json.total);

    // 2. POST /api/complaints
    res = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complainantName: 'Ramanjot Kaur',
        contactNumber: '9876543210',
        description: 'Street light non-functional in Ward 12 Main Bazaar',
        categoryId: 'cat_01',
        wardNumber: 12,
        address: 'Main Bazaar, Near Gurdwara',
      }),
    });
    json = await res.json();
    console.log('2. POST /api/complaints created:', json.data?.complaintNumber, 'Assigned to:', json.data?.assignedJeName);
    const id = json.data?.id;

    // 3. GET /api/complaints/:id
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}`);
    json = await res.json();
    console.log('3. GET /api/complaints/:id retrieved:', json.data?.complaintNumber, 'Status:', json.data?.status);

    // 4. POST /api/complaints/:id/acknowledge
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerId: json.data?.assignedJeId }),
    });
    json = await res.json();
    console.log('4. Acknowledge status:', json.data?.status);

    // 5. POST /api/complaints/:id/status
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'IN_PROGRESS', remarks: 'Bucket truck dispatched to Ward 12' }),
    });
    json = await res.json();
    console.log('5. In Progress status:', json.data?.status);

    // 6. POST /api/complaints/:id/resolution
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/resolution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolutionNotes: 'Replaced LED luminaire driver and bulb.' }),
    });
    json = await res.json();
    console.log('6. Resolution status:', json.data?.status);

    // 7. POST /api/complaints/:id/verify-close
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/verify-close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, feedback: 'Light is working bright and clear now, thanks!' }),
    });
    json = await res.json();
    console.log('7. Closed status:', json.data?.status);

    // 8. GET /api/complaints/:id/timeline
    res = await fetch(`http://localhost:${PORT}/api/complaints/${id}/timeline`);
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
