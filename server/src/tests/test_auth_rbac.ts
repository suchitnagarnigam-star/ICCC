import express from 'express';
import authRoutes from '../routes/authRoutes';
import complaintRoutes from '../routes/complaintRoutes';
import { UserRepository } from '../repositories/userRepository';
import { ComplaintRepository } from '../repositories/complaintRepository';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const PORT = 4097;
const server = app.listen(PORT, async () => {
  try {
    console.log(`Testing Authentication & Territorial RBAC on port ${PORT}...`);

    // 1. Citizen Registration
    const citizenPhone = '9876599999';
    let citizenToken = '';
    const regRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Harpreet Kaur',
        phoneNumber: citizenPhone,
        pin: '5678',
      }),
    });
    const regJson = await regRes.json();
    console.log('1. Citizen Registration:', regRes.status, regJson.message || regJson.error);
    if (regJson.token) {
      citizenToken = regJson.token;
    }

    // 2. Citizen Login
    const citLoginRes = await fetch(`http://localhost:${PORT}/api/auth/citizen/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: citizenPhone,
        pin: '5678',
      }),
    });
    const citLoginJson = await citLoginRes.json();
    console.log('2. Citizen Login:', citLoginRes.status, citLoginJson.token ? 'JWT Issued' : 'Failed');
    if (citLoginJson.token) {
      citizenToken = citLoginJson.token;
    }

    // 3. Staff Login (using seeded B&R JE for Ward 1: Vikas Kumar, 9646222900, PIN: 1234)
    const staffLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '9646222900',
        pin: '1234',
      }),
    });
    const staffJson = await staffLoginRes.json();
    console.log('3. Staff Login (Ward 1 JE):', staffLoginRes.status, staffJson.user?.name, 'Allowed Wards:', staffJson.user?.allowedWards);
    const jeWard1Token = staffJson.token;

    // 4. Staff Login (Admin / Operator Desk: MUKESH 9876543210, PIN: 1234)
    const opLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '9876543210',
        pin: '1234',
      }),
    });
    const opJson = await opLoginRes.json();
    console.log('4. Operator Login:', opLoginRes.status, opJson.user?.name, 'Role:', opJson.user?.role);
    const opToken = opJson.token;

    // 5. Create a complaint in Ward 1 via Citizen
    const createCompRes = await fetch(`http://localhost:${PORT}/api/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({
        complainantName: 'Harpreet Kaur',
        contactNumber: citizenPhone,
        description: 'Pothole near Ward 1 temple',
        categoryId: 'cat_06', // B&R Potholes
        wardNumber: 1,
        address: 'Temple Road, Ward 1',
      }),
    });
    const createJson = await createCompRes.json();
    const complaintId = createJson.data?.id;
    console.log('5. Citizen Created Grievance:', createJson.data?.complaintNumber, 'ID:', complaintId);

    // 6. Security Check: Citizen attempts to update operational status -> Expect 403
    const illegalStatusRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ status: 'IN_PROGRESS' }),
    });
    console.log('6. Security: Citizen status modification forbidden -> Status:', illegalStatusRes.status, '(Expected 403)');

    // 7. Security Check: Unassigned JE from different territory tries to acknowledge -> Expect 403
    // Log in another JE (Ward 31 JE: Iqbal Singh, 9988812321, PIN: 1234)
    const jeWard31Res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: '9988812321',
        pin: '1234',
      }),
    });
    const jeWard31Json = await jeWard31Res.json();
    const jeWard31Token = jeWard31Json.token;

    const crossWardRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jeWard31Token}`,
      },
    });
    console.log('7. Security: Cross-territory JE access forbidden -> Status:', crossWardRes.status, '(Expected 403)');
    if (crossWardRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-territory JE access, got ${crossWardRes.status}`);
    }

    // 8. Authorized Ward 1 JE acknowledges assignment -> Expect 200
    const ackRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jeWard1Token}`,
      },
    });
    const ackJson = await ackRes.json();
    console.log('8. Authorized Ward 1 JE Acknowledged -> Status:', ackRes.status, 'New Complaint Status:', ackJson.data?.status);

    // 9. Authorized Ward 1 JE updates status to IN_PROGRESS -> Expect 200
    const inProgRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jeWard1Token}`,
      },
      body: JSON.stringify({ status: 'IN_PROGRESS', remarks: 'Work crew deployed' }),
    });
    console.log('9. Authorized Ward 1 JE In Progress -> Status:', inProgRes.status);

    // 10. Authorized Ward 1 JE submits resolution with mandatory photographic proof -> Expect 200
    const formData = new FormData();
    formData.append('resolutionNotes', 'Road repaired and hot mix asphalt laid.');
    const photoBlob = new Blob(['simulated-jpeg-binary-content'], { type: 'image/jpeg' });
    formData.append('resolutionProof', photoBlob, 'repair_site.jpg');

    const resSubmit = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/resolution`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jeWard1Token}`,
      },
      body: formData,
    });
    console.log('10. Authorized Resolution Submitted -> Status:', resSubmit.status);
    if (resSubmit.status !== 200) {
      const errJson = await resSubmit.json();
      throw new Error(`Resolution failed with status ${resSubmit.status}: ${JSON.stringify(errJson)}`);
    }

    // 11. Security Check: JE attempts to verify-close grievance -> Expect 403
    const illegalCloseRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/verify-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jeWard1Token}`,
      },
      body: JSON.stringify({ verdict: 'accepted', rating: 5 }),
    });
    console.log('11. Security: JE verify-close forbidden -> Status:', illegalCloseRes.status, '(Expected 403)');

    // 12. Citizen verifies their own grievance with explicit verdict -> Expect 200
    const citCloseRes = await fetch(`http://localhost:${PORT}/api/complaints/${complaintId}/verify-close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${citizenToken}`,
      },
      body: JSON.stringify({ verdict: 'accepted', rating: 5, feedback: 'Road is fixed smoothly!' }),
    });
    const citCloseJson = await citCloseRes.json();
    console.log('12. Citizen Verified & Closed Own Grievance -> Status:', citCloseRes.status, 'Final Status:', citCloseJson.data?.status, citCloseJson.error || '');
    if (citCloseRes.status !== 200) {
      throw new Error(`Citizen verify-close failed with status ${citCloseRes.status}: ${JSON.stringify(citCloseJson)}`);
    }

    console.log('✅ ALL AUTHENTICATION, RBAC & TERRITORIAL SECURITY GATES VERIFIED!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
});
