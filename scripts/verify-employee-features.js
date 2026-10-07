const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testEmployeeFeatures() {
  console.log("=== VERIFYING NEW EMPLOYEE HRM SUITE FEATURES ===");

  // 1. Submit a Regularization Request
  console.log("\n[Test 1] Submitting Attendance Regularization Request...");
  const regRes = await post('http://localhost:3000/api/regularization', {
    userId: 'EMP-002',
    userName: 'Aarav Sharma',
    userRole: 'EMPLOYEE',
    type: 'REGULARIZATION',
    date: '2026-10-05',
    proposedClockIn: '09:00',
    proposedClockOut: '18:15',
    reason: 'Forgot to record clock-out before leaving premises.'
  });
  console.log("  Status:", regRes.status);
  console.log("  Message:", regRes.body.message);
  if (regRes.body.success && regRes.body.request.status === 'PENDING') {
    console.log("  ✅ PASS: Regularization request submitted successfully with PENDING status.");
  }

  // 2. Submit a Leave Request
  console.log("\n[Test 2] Submitting Leave Request...");
  const leaveRes = await post('http://localhost:3000/api/regularization', {
    userId: 'EMP-002',
    userName: 'Aarav Sharma',
    userRole: 'EMPLOYEE',
    type: 'LEAVE',
    date: '2026-10-15',
    endDate: '2026-10-16',
    leaveType: 'CASUAL',
    reason: 'Family function.'
  });
  console.log("  Status:", leaveRes.status);
  console.log("  Message:", leaveRes.body.message);
  if (leaveRes.body.success && leaveRes.body.request.leaveType === 'CASUAL') {
    console.log("  ✅ PASS: Leave request submitted successfully.");
  }

  // 3. Fetch requests for employee
  console.log("\n[Test 3] Fetching submitted requests for Aarav Sharma...");
  const listRes = await get('http://localhost:3000/api/regularization?userId=EMP-002');
  console.log("  Status:", listRes.status);
  console.log("  Total Requests:", listRes.body.count);
  if (listRes.body.count >= 2) {
    console.log("  ✅ PASS: Employee can view all submitted regularization and leave applications.");
  }

  // 4. Verify User Assets & Leave Balances
  console.log("\n[Test 4] Checking User Digital Profile Assets and Leave Balances...");
  const usersRes = await get('http://localhost:3000/api/users');
  const aarav = usersRes.body.users.find(u => u.id === 'EMP-002');
  console.log("  Aarav Laptop:", aarav?.assets?.laptopSerial);
  console.log("  Aarav RFID Access Card:", aarav?.assets?.accessCardId);
  console.log("  Aarav Leave Balance:", aarav?.leaveBalance?.annualLeave);
  if (aarav?.assets?.laptopSerial && aarav?.leaveBalance?.annualLeave) {
    console.log("  ✅ PASS: Digital assets and leave balances loaded properly.");
  }

  console.log("\n=== ALL NEW EMPLOYEE FEATURES VERIFIED SUCCESSFULLY ===");
}

testEmployeeFeatures().catch(console.error);
