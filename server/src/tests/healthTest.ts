import app from '../app';
import http from 'http';

async function testServer() {
  console.log('🧪 Starting server health and route tests...');
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(5099, () => {
      console.log('✓ Test server listening on port 5099');
      resolve();
    });
  });

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5099/api/health');
    const healthJson = await healthRes.json();
    console.log('✓ Health Endpoint Result:', healthJson);
    if (!healthJson.success || healthJson.status !== 'healthy') {
      throw new Error('Healthcheck assertion failed');
    }

    // 2. Reference Categories check
    const catRes = await fetch('http://localhost:5099/api/reference/categories');
    const catJson = await catRes.json();
    console.log(`✓ Reference Categories: ${catJson.count} items loaded.`);
    if (catJson.count !== 15) {
      throw new Error(`Expected 15 categories, received ${catJson.count}`);
    }

    // 3. Complaints list check
    const compRes = await fetch('http://localhost:5099/api/complaints');
    const compJson = await compRes.json();
    console.log(`✓ Complaints API: ${compJson.total} seeded records retrieved.`);
    if (!compJson.success || compJson.total < 2) {
      throw new Error('Complaints list assertion failed');
    }

    // 4. Create new complaint check
    const postRes = await fetch('http://localhost:5099/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complainantName: 'Ramesh Sharma',
        contactNumber: '9876501234',
        description: 'Open manhole near park gate in Model Town',
        categoryId: '2',
        wardNumber: 45,
        zone: 'C',
        address: 'Model Town Phase 1',
      }),
    });
    const postJson = await postRes.json();
    console.log('✓ Create Complaint API Result:', postJson.data?.complaintNumber);
    if (!postJson.success || !postJson.data?.complaintNumber) {
      throw new Error('Complaint creation assertion failed');
    }

    console.log('\n🎉 ALL SERVER API AND TYPE TESTS PASSED PERFECTLY!\n');
  } finally {
    server.close();
  }
}

testServer().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

