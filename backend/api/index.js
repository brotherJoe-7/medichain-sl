require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const FormData = require('form-data');
const fabric = require('./fabric');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Multer setup for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Connect to Hyperledger Fabric Gateway on server startup
fabric.connect().catch(err => {
    console.error('Failed to initialize Fabric gateway:', err);
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to MediChain API Gateway',
        docs: 'Visit /api/health to check server status'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'MediChain API Gateway is running',
        blockchain: 'Connected to live Fabric Network'
    });
});

// Simple WebSocket server for real-time notifications (records/access logs)
let wss;
function broadcastWs(event) {
        if (!wss) return;
        const msg = JSON.stringify(event);
        wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) client.send(msg);
        });
}

// --- Simple in-memory doctor accounts (demo) ---
const DOCTORS = [
    { id: 'doctor_smith', password: 'password', name: 'Dr. Smith', role: 'doctor' },
    { id: 'doctor_aminata', password: 'password', name: 'Dr. Aminata', role: 'doctor' },
];

// Auth: doctor login
app.post('/api/auth/login', (req, res) => {
    const { id, password } = req.body || {};
    if (!id || !password) return res.status(400).json({ error: 'id and password required' });
    const doc = DOCTORS.find(d => d.id === id && d.password === password);
    if (!doc) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: doc.id, role: doc.role, name: doc.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, doctorId: doc.id, name: doc.name });
});

// Middleware to authenticate doctor JWT
function authenticateDoctor(req, res, next) {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Authorization' });
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // set doctor info
        return next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Endpoint for OCR Extraction using Gemini
app.post('/api/extract', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        // Convert the uploaded file to base64 for Gemini
        const base64Data = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        const prompt = `
        Analyze this medical document. Extract the key medical details and map them to an HL7 FHIR R4 JSON format.
        Return ONLY valid JSON with the following structure:
        {
          "title": "Short title of the document",
          "date": "YYYY-MM-DD",
          "type": "General | Laboratory | Radiology | Prescription",
          "doctor": "Doctor Name if available",
          "hospital": "Hospital Name if available",
          "aiInsights": "A brief summary of the findings in plain English",
          "confidence": 0.95,
          "fhirResource": {
            // The HL7 FHIR R4 standard JSON object (e.g. Observation, DiagnosticReport, etc.)
          }
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { inlineData: { data: base64Data, mimeType } },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                temperature: 0.2,
                responseMimeType: 'application/json'
            }
        });

        if (response.text) {
            const extractedData = JSON.parse(response.text);
            return res.json(extractedData);
        } else {
            throw new Error("Failed to extract data from Gemini");
        }

    } catch (error) {
        console.error('Error during extraction:', error);
        res.status(500).json({ error: 'Failed to process document' });
    }
});

// IPFS upload — tries local IPFS node (port 5001) first, then Pinata cloud, then simulation
app.post('/api/ipfs/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        const localIpfsUrl = process.env.IPFS_API_URL || 'http://127.0.0.1:5001';
        const pinataJwt    = process.env.PINATA_JWT;

        // ── 1. Try local IPFS daemon (IPFS Desktop / Kubo) ──────────────────
        try {
            console.log('📡 [IPFS] Uploading to local IPFS daemon at', localIpfsUrl);
            const formData = new FormData();
            formData.append('file', req.file.buffer, {
                filename: req.file.originalname || 'medical_record.pdf',
                contentType: req.file.mimetype
            });

            const response = await axios.post(
                `${localIpfsUrl}/api/v0/add?pin=true`,
                formData,
                { headers: formData.getHeaders(), timeout: 10000 }
            );

            const hash = response.data.Hash;
            console.log('🟢 [IPFS Local] Upload success! Hash:', hash);
            return res.json({ hash, gateway: `${process.env.IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs/'}${hash}`, source: 'local' });

        } catch (localErr) {
            console.warn('⚠️ [IPFS Local] Daemon not reachable, trying Pinata...', localErr.message);
        }

        // ── 2. Try Pinata cloud ──────────────────────────────────────────────
        if (pinataJwt && pinataJwt !== 'YOUR_PINATA_JWT_HERE') {
            console.log('📡 [IPFS] Uploading to Pinata cloud...');
            const formData = new FormData();
            formData.append('file', req.file.buffer, {
                filename: req.file.originalname || 'medical_record.pdf',
                contentType: req.file.mimetype
            });

            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: { ...formData.getHeaders(), 'Authorization': `Bearer ${pinataJwt}` },
                maxBodyLength: Infinity
            });

            const hash = response.data.IpfsHash;
            console.log('🟢 [IPFS Pinata] Upload success! Hash:', hash);
            return res.json({ hash, gateway: `https://gateway.pinata.cloud/ipfs/${hash}`, source: 'pinata' });
        }

        // ── 3. Simulation fallback ───────────────────────────────────────────
        console.warn('⚠️ No IPFS provider available. Simulating upload...');
        await new Promise(resolve => setTimeout(resolve, 500));
        const buf = require('crypto').randomBytes(21);
        const simulatedHash = 'Qm' + buf.toString('hex').slice(0, 44);
        console.log('🟡 [IPFS Simulated] Hash:', simulatedHash);
        return res.json({ hash: simulatedHash, source: 'simulated' });

    } catch (error) {
        console.error('❌ IPFS upload error:', error.message);
        res.status(500).json({ error: 'Failed to upload to IPFS: ' + error.message });
    }
});

// Generate a server-signed short-lived QR token (JWT)
app.post('/api/qr/generate', (req, res) => {
    const userId = req.body?.userId || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '2m' });
    // Broadcast token issuance for auditing (no sensitive content)
    broadcastWs({ type: 'qr.generated', userId, issuedAt: Date.now() });
    res.json({ token, expiresIn: 120 });
});

// Verify token and return emergency payload if allowed
app.post('/api/qr/verify', authenticateDoctor, async (req, res) => {
    const { token } = req.body || {};
    const doctorId = req.user?.id || req.user?.sub || 'unknown';
    if (!token) return res.status(400).json({ error: 'token required' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const patientId = payload.userId;

        // Audit log the QR verification attempt
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction('audit', 'AddAuditLog', auditId, doctorId, 'doctor', patientId, 'QR_VERIFY', `Doctor verified QR for patient ${patientId}`, 'success');
        } catch (e) { console.warn('Audit log failed for QR verify', e.message); }

        // Attempt to fetch emergency payload from chaincode, fallback to simulated
        try {
            const result = await fabric.evaluateTransaction('patient', 'GetEmergencyPayload', patientId);
            const payloadObj = JSON.parse(result.toString());
            broadcastWs({ type: 'qr.verified', doctorId, patientId, timestamp: Date.now() });
            return res.json({ success: true, payload: payloadObj });
        } catch (err) {
            const simulated = {
                patientId,
                name: 'Alex Johnson',
                bloodType: 'O+',
                allergies: ['Penicillin', 'Peanuts'],
                medications: ['Lisinopril 10mg'],
                conditions: ['Hypertension'],
                emergencyContact: '+232 76 555 123 (Wife)',
                tokenExpiry: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleTimeString()
            };
            broadcastWs({ type: 'qr.verified', doctorId, patientId, timestamp: Date.now(), simulated: true });
            return res.json({ success: true, payload: simulated });
        }
    } catch (e) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Emergency Break-Glass Access
app.post('/api/emergency/access', async (req, res) => {
    const { patientId, doctorId } = req.body;
    
    if (!patientId || !doctorId) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        console.log(`🚨 [Blockchain] EMERGENCY ACCESS TRIGGERED: Doctor ${doctorId} accessing ${patientId}`);
        
        // 1. Audit log the emergency access
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                doctorId,
                'doctor',
                patientId,
                'EMERGENCY_ACCESS',
                `Break-Glass Protocol used via NFC Scan`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit emergency audit trail:', auditErr);
        }

        // 2. Return the temporary emergency payload
        res.json({
            success: true,
            payload: {
                patientId,
                name: 'Alex Johnson',
                bloodType: 'O+',
                allergies: ['Penicillin', 'Peanuts'],
                medications: ['Lisinopril 10mg'],
                conditions: ['Hypertension'],
                emergencyContact: '+232 76 555 123 (Wife)',
                tokenExpiry: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleTimeString()
            }
        });
    } catch (error) {
        console.error('❌ Emergency Access Error:', error);
        res.status(500).json({ error: 'Emergency access failed: ' + error.message });
    }
});

// Wallet balance endpoint — attempts chaincode call then falls back to simulated balance
app.get('/api/wallet/:patientId', async (req, res) => {
    const pid = req.params.patientId;
    if (!pid) return res.status(400).json({ error: 'patientId required' });
    try {
        const result = await fabric.evaluateTransaction('patient', 'GetWalletBalance', pid);
        const balance = JSON.parse(result.toString());
        return res.json({ balance });
    } catch (err) {
        // Simulate from local DB or return 0
        const simulated = 0;
        return res.json({ balance: simulated, simulated: true });
    }
});

// Notarize medical record on Hyperledger Fabric ledger
app.post('/api/records/notarize', async (req, res) => {
    const { patientId, recordId, documentHash, ipfsHash, recordType, doctorId, patientSignature } = req.body;
    
    if (!patientId || !documentHash) {
        return res.status(400).json({ error: 'Missing required notarization fields: patientId, documentHash' });
    }

    try {
        console.log(`📡 [Blockchain] Notarizing record for patient: ${patientId}`);
        
        // Invoke AddDocument on the 'patient' smart contract
        const result = await fabric.submitTransaction(
            'patient',
            'AddDocument',
            patientId,
            documentHash,
            ipfsHash || '',
            recordType || 'General',
            doctorId || 'Self',
            patientSignature || 'Signed'
        );

        // Commit audit log entry onto the 'audit' smart contract
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                doctorId || 'Self',
                'doctor',
                patientId,
                'ADD_RECORD',
                `Notarized record hash ${documentHash.slice(0, 10)}...`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit audit trail onto blockchain:', auditErr);
        }

        res.json({ 
            success: true, 
            txHash: result.txHash, 
            status: 'Notarized on Hyperledger Fabric Ledger',
            mode: 'Production'
        });
    } catch (error) {
        console.error('❌ Blockchain Notarization Error:', error);
        res.status(500).json({ error: 'Failed to notarize on blockchain: ' + error.message });
    }
});

// Grant access to a doctor
app.post('/api/access/grant', async (req, res) => {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
        return res.status(400).json({ error: 'Missing required parameters: patientId, doctorId' });
    }

    try {
        console.log(`📡 [Blockchain] Granting access for doctor ${doctorId} to patient ${patientId}`);
        const result = await fabric.submitTransaction('patient', 'GrantAccess', patientId, doctorId);

        // Commit audit log entry onto the 'audit' smart contract
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                patientId,
                'patient',
                doctorId,
                'GRANT_ACCESS',
                `Granted access permission to doctor ID ${doctorId}`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit audit trail for access grant:', auditErr);
        }

        res.json({ 
            success: true, 
            txHash: result.txHash,
            status: result.status 
        });
    } catch (error) {
        console.error('❌ Blockchain Grant Access Error:', error);
        res.status(500).json({ error: 'Failed to grant access on blockchain: ' + error.message });
    }
});

// Revoke access from a doctor
app.post('/api/access/revoke', async (req, res) => {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
        return res.status(400).json({ error: 'Missing required parameters: patientId, doctorId' });
    }

    try {
        console.log(`📡 [Blockchain] Revoking access for doctor ${doctorId} from patient ${patientId}`);
        const result = await fabric.submitTransaction('patient', 'RevokeAccess', patientId, doctorId);

        // Commit audit log entry onto the 'audit' smart contract
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction(
                'audit',
                'AddAuditLog',
                auditId,
                patientId,
                'patient',
                doctorId,
                'REVOKE_ACCESS',
                `Revoked access permission from doctor ID ${doctorId}`,
                'success'
            );
        } catch (auditErr) {
            console.error('Failed to commit audit trail for access revocation:', auditErr);
        }

        res.json({ 
            success: true, 
            txHash: result.txHash,
            status: result.status 
        });
    } catch (error) {
        console.error('❌ Blockchain Revoke Access Error:', error);
        res.status(500).json({ error: 'Failed to revoke access on blockchain: ' + error.message });
    }
});

// ── Patient CRUD ─────────────────────────────────────────────────────────────

// Register a new patient on the blockchain
app.post('/api/patients', async (req, res) => {
    const { id, name, age, gender, dob, phone, email, address, bloodType, condition, allergies, medications, notes, doctorId } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'Patient id and name are required' });

    try {
        console.log(`📡 [Blockchain] Registering patient: ${id}`);
        const result = await fabric.submitTransaction(
            'patient',
            'CreatePatient',
            id,
            JSON.stringify({ name, age, gender, dob, phone, email, address, bloodType, condition, allergies: allergies || [], medications: medications || [], notes: notes || '', status: 'Active', lastVisit: new Date().toISOString().split('T')[0] }),
            doctorId || 'self'
        );

        // Audit log
        try {
            const auditId = 'aud_' + Math.random().toString(36).substring(2, 11);
            await fabric.submitTransaction('audit', 'AddAuditLog', auditId, doctorId || 'self', 'doctor', id, 'CREATE_PATIENT', `Registered patient ${name}`, 'success');
        } catch (e) { /* non-fatal */ }

        res.status(201).json({ success: true, patientId: id, txHash: result.txHash });
    } catch (error) {
        console.error('❌ Create Patient Error:', error);
        res.status(500).json({ error: 'Failed to register patient: ' + error.message });
    }
});

// Get all patients for a doctor
app.get('/api/patients', async (req, res) => {
    const doctorId = req.query.doctorId || 'doctor_smith';
    try {
        console.log(`📡 [Blockchain] Querying patients for doctor: ${doctorId}`);
        const result = await fabric.evaluateTransaction('patient', 'GetPatientsByDoctor', doctorId);
        const patients = JSON.parse(result.toString() || '[]');
        res.json(patients);
    } catch (error) {
        console.warn('⚠️ GetPatientsByDoctor not supported, returning empty:', error.message);
        res.json([]);
    }
});

// Get single patient
app.get('/api/patients/:id', async (req, res) => {
    try {
        const result = await fabric.evaluateTransaction('patient', 'GetPatient', req.params.id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(404).json({ error: 'Patient not found: ' + error.message });
    }
});

// ── Records ───────────────────────────────────────────────────────────────────

// Get all records for a patient
app.get('/api/records', async (req, res) => {
    const patientId = req.query.patientId;
    if (!patientId) return res.status(400).json({ error: 'patientId query param required' });
    try {
        console.log(`📡 [Blockchain] Querying records for patient: ${patientId}`);
        const result = await fabric.evaluateTransaction('patient', 'GetPatientDocuments', patientId);
        const records = JSON.parse(result.toString() || '[]');
        res.json(records);
    } catch (error) {
        console.warn('⚠️ GetPatientDocuments error:', error.message);
        res.json([]);
    }
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const healthRes = await fabric.evaluateTransaction('audit', 'GetAuditStats');
        const stats = JSON.parse(healthRes.toString() || '{}');
        res.json(stats);
    } catch {
        // Fallback: return zeros if chaincode doesn't expose stats yet
        res.json({ totalPatients: 0, todayAppointments: 0, pendingRecords: 0, syncRate: 100 });
    }
});

// ── Audit Log ─────────────────────────────────────────────────────────────────
app.get('/api/audit/log', async (req, res) => {
    const actorId = req.query.actorId || '';
    try {
        console.log(`📡 [Blockchain] Querying audit log for: ${actorId}`);
        const result = await fabric.evaluateTransaction('audit', 'GetAuditTrailByActor', actorId);
        res.json(JSON.parse(result.toString() || '[]'));
    } catch (error) {
        res.json([]);
    }
});

// Graceful gateway shutdown
process.on('SIGINT', async () => {
    console.log('Gracefully disconnecting from Fabric gateway...');
    await fabric.disconnect();
    process.exit(0);
});

const server = app.listen(port, () => {
    console.log(`🚀 MediChain API Gateway listening on port ${port}`);
});

// Attach WebSocket server
wss = new WebSocket.Server({ server });
wss.on('connection', (socket) => {
    console.log('🔌 WebSocket client connected');
    socket.on('close', () => console.log('🔌 WebSocket client disconnected'));
});

// Expose broadcast helper for other modules if needed
module.exports.broadcastWs = broadcastWs;
