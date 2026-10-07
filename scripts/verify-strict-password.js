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

async function verifyStrictPasswordFlow() {
  console.log("=== VERIFYING STRICT PASSWORD ENFORCEMENT & SUPABASE STORAGE ===");

  // 1. Authenticate with initial password
  console.log("\n[Test 1] Login with initial password (deepika)...");
  const initLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'deepika.p',
    password: 'deepika'
  });
  console.log("  Initial login status:", initLogin.status, initLogin.body.user ? `Authenticated as ${initLogin.body.user.name}` : 'Failed');
  if (initLogin.status === 200) {
    console.log("  ✅ Initial login successful.");
  }

  // 2. Change password to 'MyNewAdminPass2026!'
  console.log("\n[Test 2] Updating password to 'MyNewAdminPass2026!'...");
  const changeRes = await post('http://localhost:3000/api/auth/change-password', {
    userId: 'EMP-001',
    oldPassword: 'deepika',
    newPassword: 'MyNewAdminPass2026!'
  });
  console.log("  Change password response:", changeRes.status, changeRes.body.message);
  if (changeRes.body.success) {
    console.log("  ✅ Password changed successfully.");
  }

  // 3. Attempt login with PREVIOUS password 'deepika' (MUST FAIL)
  console.log("\n[Test 3] Attempting login with PREVIOUS password ('deepika')...");
  const oldLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'deepika.p',
    password: 'deepika'
  });
  console.log("  Previous password login status:", oldLogin.status, oldLogin.body.error || oldLogin.body.message);
  if (oldLogin.status === 401 && !oldLogin.body.success) {
    console.log("  ✅ PASS: Previous password was strictly rejected! Cannot log in with old password.");
  } else {
    console.error("  ❌ FAIL: Previous password was still accepted!");
  }

  // 4. Attempt login with NEW password 'MyNewAdminPass2026!' (MUST SUCCEED)
  console.log("\n[Test 4] Attempting login with NEW password ('MyNewAdminPass2026!')...");
  const newLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'deepika.p',
    password: 'MyNewAdminPass2026!'
  });
  console.log("  New password login status:", newLogin.status, newLogin.body.user ? `Authenticated as ${newLogin.body.user.name}` : 'Failed');
  if (newLogin.status === 200 && newLogin.body.success) {
    console.log("  ✅ PASS: Authenticated successfully with NEW password.");
  } else {
    console.error("  ❌ FAIL: New password login failed!");
  }

  // 5. Test Employee password change
  console.log("\n[Test 5] Testing Employee (Aarav Sharma) password change...");
  const empChange = await post('http://localhost:3000/api/auth/change-password', {
    userId: 'EMP-002',
    oldPassword: 'aarav',
    newPassword: 'AaravNewPassword999!'
  });
  console.log("  Employee password change status:", empChange.status);

  const empOldLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'aarav.sharma',
    password: 'aarav'
  });
  if (empOldLogin.status === 401) {
    console.log("  ✅ PASS: Aarav's old password strictly rejected.");
  }

  const empNewLogin = await post('http://localhost:3000/api/auth/login', {
    identifier: 'aarav.sharma',
    password: 'AaravNewPassword999!'
  });
  if (empNewLogin.status === 200) {
    console.log("  ✅ PASS: Aarav authenticated with new password.");
  }

  // Reset back to initial default for continuous demo usage
  await post('http://localhost:3000/api/auth/change-password', {
    userId: 'EMP-001',
    oldPassword: 'MyNewAdminPass2026!',
    newPassword: 'deepika'
  });
  await post('http://localhost:3000/api/auth/change-password', {
    userId: 'EMP-002',
    oldPassword: 'AaravNewPassword999!',
    newPassword: 'aarav'
  });

  console.log("\n=== STRICT PASSWORD VERIFICATION COMPLETED ===");
}

verifyStrictPasswordFlow().catch(console.error);
