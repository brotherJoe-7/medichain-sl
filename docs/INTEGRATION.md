# MediChain Integration Notes

This document describes the QR/NFC authentication and real-time integration added.

Components:
- Backend: `backend/api` exposes:
  - `POST /api/auth/login` — doctor login (demo accounts in DOCTORS array).
  - `POST /api/qr/generate` — generate server-signed short-lived JWT token for patient (expires ~2m).
  - `POST /api/qr/verify` — verify QR JWT; requires `Authorization: Bearer <doctor_jwt>` and returns emergency payload.
  - `GET /api/wallet/:patientId` — wallet balance (attempts chaincode call, falls back to 0).
  - WebSocket broadcast server attached to the same port. Events: `qr.generated`, `qr.verified`.

- Mobile app:
  - Requests QR tokens from backend (`generateQrToken`) and auto-refreshes every 60s.
  - Can write QR token to NFC (requires native `react-native-nfc-manager` setup).
  - `DoctorScanScreen` uses `expo-barcode-scanner` to capture QR codes and verifies them via `/api/qr/verify`.
  - WebSocket client runs via `useWebSocket` and records QR events into local store.

- Doctor Web:
  - Adds camera scanner via `html5-qrcode` to auto-scan QR tokens and verify with backend.
  - Doctor login stores JWT in `localStorage.mc_doctor_jwt` and is automatically used for requests.

Running and testing:
1. Install backend deps and start server:

```bash
cd backend/api
npm install
npm run dev
```

2. Run backend test script (after server running):

```bash
node test/test_qr_flow.js
```

3. Mobile app: configure `apiBaseUrl` in Expo `app.json` extras or set environment so the app can reach backend. For NFC support install `react-native-nfc-manager` and configure native projects.

4. Doctor web: install deps and run:

```bash
cd doctor-web
npm install
npm run dev
```

Security notes:
- Replace the demo in-memory doctor accounts with real user management and secure passwords.
- Set `JWT_SECRET` in backend env for production.
- Enforce TLS (HTTPS/WSS) in production.
- Sign QR tokens server-side (done) and verify roles before releasing patient data (done for `/api/qr/verify`).
