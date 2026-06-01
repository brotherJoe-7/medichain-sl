const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const BASE = process.env.BASE || 'http://localhost:3000/api';

async function main() {
  // 1. Doctor login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'doctor_smith', password: 'password' })
  });
  const login = await loginRes.json();
  console.log('login:', login);
  const token = login.token;

  // 2. Generate QR for patient
  const genRes = await fetch(`${BASE}/qr/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: 'PAT-10492' }) });
  const gen = await genRes.json();
  console.log('generated:', gen);

  // 3. Verify QR using doctor token
  const verifyRes = await fetch(`${BASE}/qr/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ token: gen.token }) });
  const verify = await verifyRes.json();
  console.log('verify:', verify);
}

main().catch(err => console.error(err));
