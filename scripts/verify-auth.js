const http = require('http');

function post(url, data, cookies = '') {
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
        'Cookie': cookies
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(url, cookies = '') {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log("=== WORKPULSE HRM AUTHENTICATION & ROLE SUITE VERIFICATION ===");

  // 1. Test unauthenticated state (Initial load should NOT auto-login as Admin)
  console.log("\n[Test 1] Checking unauthenticated session (/api/auth/me)...");
  const meRes = await get('http://localhost:3000/api/auth/me');
  console.log("  Status:", meRes.status);
  console.log("  Response:", meRes.body);
  if (!meRes.body.user) {
    console.log("  ✅ PASS: Initial entry is unauthenticated (no auto-login to Admin).");
  } else {
    console.error("  ❌ FAIL: Still auto-authenticating as:", meRes.body.user.name);
  }

  // 2. Test Admin login with Deepika Pillai
  console.log("\n[Test 2] Testing Admin Login (deepika.p / deepika)...");
  const adminLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'deepika.p',
    password: 'deepika'
  });
  console.log("  Status:", adminLogin.status);
  console.log("  User:", adminLogin.body.user ? `${adminLogin.body.user.name} (${adminLogin.body.user.role})` : 'Failed');
  if (adminLogin.body.success && adminLogin.body.user.name === 'Deepika Pillai' && adminLogin.body.user.role === 'ADMIN') {
    console.log("  ✅ PASS: Deepika Pillai is authenticated as ADMIN.");
  } else {
    console.error("  ❌ FAIL: Admin authentication failed.");
  }

  // Extract session cookie
  const setCookie = adminLogin.headers['set-cookie'] ? adminLogin.headers['set-cookie'][0] : '';
  const cookieVal = setCookie.split(';')[0];

  // Verify authenticated session with cookie
  console.log("\n[Test 3] Verifying active session persistence with cookie...");
  const authMe = await get('http://localhost:3000/api/auth/me', cookieVal);
  if (authMe.body.user && authMe.body.user.name === 'Deepika Pillai') {
    console.log("  ✅ PASS: Session verified for Deepika Pillai.");
  }

  // 3. Test Employee login with Aarav Sharma (easy password: 'aarav')
  console.log("\n[Test 4] Testing Employee Login (aarav.sharma / aarav)...");
  const empLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'aarav.sharma',
    password: 'aarav'
  });
  console.log("  Status:", empLogin.status);
  console.log("  User:", empLogin.body.user ? `${empLogin.body.user.name} (${empLogin.body.user.role})` : 'Failed');
  if (empLogin.body.success && empLogin.body.user.role === 'EMPLOYEE') {
    console.log("  ✅ PASS: Employee authenticated with easy first-name password.");
  }

  // 4. Test Intern login with Diya Choudhury (easy password: 'diya')
  console.log("\n[Test 5] Testing Intern Login (diya.c / diya)...");
  const internLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'diya.c',
    password: 'diya'
  });
  console.log("  Status:", internLogin.status);
  console.log("  User:", internLogin.body.user ? `${internLogin.body.user.name} (${internLogin.body.user.role})` : 'Failed');
  if (internLogin.body.success && internLogin.body.user.role === 'INTERN') {
    console.log("  ✅ PASS: Intern authenticated with easy first-name password.");
  }

  // 5. Test Supabase sync endpoint
  console.log("\n[Test 6] Testing Supabase Sync route (/api/supabase/sync)...");
  const syncRes = await post('http://localhost:3000/api/supabase/sync', {});
  console.log("  Status:", syncRes.status);
  console.log("  Sync Message:", syncRes.body.message);
  console.log("  Total Staff in DB:", syncRes.body.totalStaffCount);
  if (syncRes.body.totalStaffCount >= 30) {
    console.log("  ✅ PASS: All 30 verified Indian staff & intern profiles loaded with Supabase sync.");
  }

  // 6. Test Privacy rule: Clock-out should set currentLocation to null
  console.log("\n[Test 7] Testing Privacy Rule (clock-out masks coordinates)...");
  const clockOutRes = await post('http://localhost:3000/api/attendance', {
    action: 'CLOCK_OUT',
    userId: 'EMP-002', // Aarav Sharma
    notes: 'End of daily shift'
  });
  console.log("  Clock-out Status:", clockOutRes.status);
  console.log("  Clocked-out user location:", clockOutRes.body.user?.currentLocation);
  if (clockOutRes.body.user && clockOutRes.body.user.currentLocation === null) {
    console.log("  ✅ PASS: Privacy protected. Off-duty employee coordinates are completely null/hidden.");
  }

  console.log("\n=== ALL AUTHENTICATION & PRIVACY SUITE CHECKS COMPLETED ===");
}

runTests().catch(console.error);
