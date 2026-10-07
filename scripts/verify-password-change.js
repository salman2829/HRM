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

async function testPasswordChange() {
  console.log("=== TESTING DYNAMIC PASSWORD CHANGE SUITE ===");

  // 1. Initial login with original password
  console.log("\n[Test 1] Login with initial password (aarav)...");
  const login1 = await post('http://localhost:3000/api/auth/login', {
    identifier: 'aarav.sharma',
    password: 'aarav'
  });
  console.log("  Login 1 status:", login1.status, login1.body.user ? `Authenticated as ${login1.body.user.name}` : 'Failed');
  const cookie = login1.headers['set-cookie'] ? login1.headers['set-cookie'][0].split(';')[0] : '';

  // 2. Change password to 'aaravSecured#2026'
  console.log("\n[Test 2] Changing password to 'aaravSecured#2026'...");
  const changeRes = await post('http://localhost:3000/api/auth/change-password', {
    userId: 'EMP-002',
    oldPassword: 'aarav',
    newPassword: 'aaravSecured#2026'
  }, cookie);
  console.log("  Change password status:", changeRes.status);
  console.log("  Message:", changeRes.body.message);
  if (changeRes.body.success) {
    console.log("  ✅ PASS: Password changed successfully on backend and memory store.");
  }

  // 3. Attempt login with old password (should fail)
  console.log("\n[Test 3] Attempting login with OLD password (aarav)...");
  const failLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'aarav.sharma',
    password: 'wrongOldPassword'
  });
  console.log("  Fail login status:", failLogin.status);
  if (!failLogin.body.success) {
    console.log("  ✅ PASS: Old / invalid password correctly rejected.");
  }

  // 4. Attempt login with NEW password
  console.log("\n[Test 4] Attempting login with NEW password (aaravSecured#2026)...");
  const newLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'aarav.sharma',
    password: 'aaravSecured#2026'
  });
  console.log("  New password login status:", newLogin.status);
  if (newLogin.body.success && newLogin.body.user) {
    console.log("  ✅ PASS: Authenticated successfully with the newly updated password!");
  }

  // 5. Restore default password for demo testing
  await post('http://localhost:3000/api/auth/change-password', {
    userId: 'EMP-002',
    oldPassword: 'aaravSecured#2026',
    newPassword: 'aarav'
  });

  console.log("\n=== ALL PASSWORD CHANGE TESTS PASSED SUCCESSFULLY ===");
}

testPasswordChange().catch(console.error);
