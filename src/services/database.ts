/**
 * MediChain Database Service
 * Built on expo-sqlite v16 (async API)
 *
 * This service is the single source of truth for all persisted data.
 * Zustand reads from here on startup and writes here on every mutation.
 */
import { Platform } from 'react-native';
import { User, Medication, Record, Appointment, BlockchainLog, HealthMetric, Allergy, DoctorAccessRequest } from '../types';

// Dynamic import of expo-sqlite to avoid bundler crashes on Web
let SQLite: any = null;
if (Platform.OS !== 'web') {
  try {
    SQLite = require('expo-sqlite');
  } catch (e) {
    console.warn('[DB] Failed to load expo-sqlite natively:', e);
  }
}

let db: any = null;

// ─── Web Database Adapter (GAP Fallback) ───────────────────────────────────

let webDb: {
  users: { [id: string]: User };
  medications: Medication[];
  records: Record[];
  appointments: Appointment[];
  blockchain_logs: BlockchainLog[];
  health_metrics: HealthMetric[];
  allergies: Allergy[];
  doctor_access_requests: DoctorAccessRequest[];
  record_amendments: any[];
  fhir_resources: any[];
} = {
  users: {},
  medications: [],
  records: [],
  appointments: [],
  blockchain_logs: [],
  health_metrics: [],
  allergies: [],
  doctor_access_requests: [],
  record_amendments: [],
  fhir_resources: [],
};

function loadWebData() {
  if (Platform.OS !== 'web') return;
  try {
    const data = localStorage.getItem('medichain_web_db');
    if (data) {
      webDb = { ...webDb, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('[DB Polyfill] Failed to load web database:', e);
  }
}

function saveWebData() {
  if (Platform.OS !== 'web') return;
  try {
    localStorage.setItem('medichain_web_db', JSON.stringify(webDb));
  } catch (e) {
    console.warn('[DB Polyfill] Failed to save web database:', e);
  }
}

// ─── Initialise ────────────────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  if (Platform.OS === 'web') {
    loadWebData();
    console.log('🖥️ [DB Service] Web Storage database initialized.');
    return;
  }

  if (!SQLite) {
    console.warn('[DB Service] Native SQLite is missing. Database cannot be initialized.');
    return;
  }

  db = await SQLite.openDatabaseAsync('medichain_v1.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      phone       TEXT,
      blood_type  TEXT,
      weight      TEXT,
      height      TEXT,
      avatar      TEXT
    );

    CREATE TABLE IF NOT EXISTS medications (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      dosage     TEXT NOT NULL,
      frequency  TEXT,
      time       TEXT NOT NULL,
      status     TEXT NOT NULL DEFAULT 'pending',
      patient_id TEXT
    );

    CREATE TABLE IF NOT EXISTS records (
      id             TEXT PRIMARY KEY,
      title          TEXT NOT NULL,
      date           TEXT NOT NULL,
      type           TEXT NOT NULL,
      doctor         TEXT NOT NULL,
      hospital       TEXT NOT NULL,
      file_uri       TEXT,
      ai_insights    TEXT,
      hash           TEXT,
      notarized      INTEGER DEFAULT 0,
      supersedes     TEXT,
      fhir_resource  TEXT,
      patient_signature TEXT,
      patient_id     TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id          TEXT PRIMARY KEY,
      doctor_name TEXT NOT NULL,
      specialty   TEXT NOT NULL,
      date        TEXT NOT NULL,
      time        TEXT NOT NULL,
      status      TEXT NOT NULL DEFAULT 'upcoming',
      patient_id  TEXT
    );

    CREATE TABLE IF NOT EXISTS blockchain_logs (
      id         TEXT PRIMARY KEY,
      action     TEXT NOT NULL,
      timestamp  TEXT NOT NULL,
      details    TEXT NOT NULL,
      tx_hash    TEXT NOT NULL,
      patient_id TEXT
    );

    CREATE TABLE IF NOT EXISTS health_metrics (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL,
      value      REAL NOT NULL,
      unit       TEXT NOT NULL,
      date       TEXT NOT NULL,
      patient_id TEXT
    );

    CREATE TABLE IF NOT EXISTS allergies (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL,
      name       TEXT NOT NULL,
      text_val   TEXT,
      severity   TEXT NOT NULL,
      reaction   TEXT NOT NULL,
      patient_id TEXT
    );

    CREATE TABLE IF NOT EXISTS doctor_access_requests (
      id            TEXT PRIMARY KEY,
      doctor_id     TEXT NOT NULL,
      doctor_name   TEXT NOT NULL,
      hospital      TEXT NOT NULL,
      requested_at  TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      expires_at    TEXT,
      patient_id    TEXT
    );

    CREATE TABLE IF NOT EXISTS record_amendments (
      id                TEXT PRIMARY KEY,
      original_record_id TEXT NOT NULL,
      amended_record_id TEXT NOT NULL,
      amendment_reason  TEXT,
      amended_by        TEXT NOT NULL,
      amended_at        TEXT NOT NULL,
      FOREIGN KEY (original_record_id) REFERENCES records(id),
      FOREIGN KEY (amended_record_id) REFERENCES records(id)
    );

    CREATE TABLE IF NOT EXISTS fhir_resources (
      id                TEXT PRIMARY KEY,
      record_id         TEXT NOT NULL,
      resource_type     TEXT NOT NULL,
      resource_data     TEXT NOT NULL,
      created_at        TEXT NOT NULL,
      FOREIGN KEY (record_id) REFERENCES records(id)
    );
  `);
  await migratePatientColumns();
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

async function columnExists(table: string, column: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const rows = await getDb().getAllAsync(`PRAGMA table_info(${table})`);
  return rows.some((row: any) => row.name === column);
}

async function migratePatientColumns(): Promise<void> {
  if (Platform.OS === 'web') return;
  const tables = [
    'medications',
    'records',
    'appointments',
    'blockchain_logs',
    'health_metrics',
    'allergies',
    'doctor_access_requests',
  ];

  for (const table of tables) {
    if (!(await columnExists(table, 'patient_id'))) {
      await getDb().runAsync(`ALTER TABLE ${table} ADD COLUMN patient_id TEXT`);
    }
  }
}

// ─── Users ─────────────────────────────────────────────────────────────────

export const UserDB = {
  async get(): Promise<User | null> {
    if (Platform.OS === 'web') {
      const keys = Object.keys(webDb.users);
      if (keys.length === 0) return null;
      return webDb.users[keys[0]];
    }
    const row = await getDb().getFirstAsync('SELECT * FROM users LIMIT 1');
    if (!row) return null;
    return mapUser(row);
  },

  async getById(id: string): Promise<User | null> {
    if (Platform.OS === 'web') {
      return webDb.users[id] || null;
    }
    const row = await getDb().getFirstAsync('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;
    return mapUser(row);
  },

  async upsert(user: User): Promise<void> {
    if (Platform.OS === 'web') {
      webDb.users[user.id] = user;
      saveWebData();
      return;
    }
    await getDb().runAsync(
      `INSERT INTO users (id, name, email, phone, blood_type, weight, height, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name=excluded.name, email=excluded.email, phone=excluded.phone,
         blood_type=excluded.blood_type, weight=excluded.weight,
         height=excluded.height, avatar=excluded.avatar`,
      [user.id, user.name, user.email, user.phone, user.bloodType, user.weight, user.height, user.avatar ?? null]
    );
  },

  async delete(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      delete webDb.users[id];
      saveWebData();
      return;
    }
    await getDb().runAsync('DELETE FROM users WHERE id = ?', [id]);
  },
};

// ─── Medications ────────────────────────────────────────────────────────────

export const MedicationDB = {
  async getAll(patientId?: string): Promise<Medication[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      return webDb.medications
        .filter(m => m.patientId === patientId)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM medications WHERE patient_id = ? ORDER BY time ASC',
      [patientId]
    );
    return rows.map(mapMedication);
  },

  async insert(med: Medication): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.medications.findIndex(m => m.id === med.id);
      if (idx !== -1) {
        webDb.medications[idx] = med;
      } else {
        webDb.medications.push(med);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      'INSERT OR REPLACE INTO medications (id, name, dosage, frequency, time, status, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [med.id, med.name, med.dosage, med.frequency ?? null, med.time, med.status, med.patientId ?? null]
    );
  },

  async updateStatus(id: string, status: Medication['status']): Promise<void> {
    if (Platform.OS === 'web') {
      const med = webDb.medications.find(m => m.id === id);
      if (med) {
        med.status = status;
        saveWebData();
      }
      return;
    }
    await getDb().runAsync('UPDATE medications SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      webDb.medications = webDb.medications.filter(m => m.id !== id);
      saveWebData();
      return;
    }
    await getDb().runAsync('DELETE FROM medications WHERE id = ?', [id]);
  },

  async seed(meds: Medication[]): Promise<void> {
    for (const med of meds) await MedicationDB.insert(med);
  },
};

// ─── Records ────────────────────────────────────────────────────────────────

export const RecordDB = {
  async getAll(patientId?: string): Promise<Record[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      return webDb.records
        .filter(r => r.patientId === patientId)
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM records WHERE patient_id = ? ORDER BY date DESC',
      [patientId]
    );
    return rows.map(mapRecord);
  },

  async insert(record: Record): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.records.findIndex(r => r.id === record.id);
      if (idx !== -1) {
        webDb.records[idx] = record;
      } else {
        webDb.records.push(record);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      `INSERT OR REPLACE INTO records
         (id, title, date, type, doctor, hospital, file_uri, ai_insights, hash, notarized, supersedes, fhir_resource, patient_signature, patient_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id, record.title, record.date, record.type,
        record.doctor, record.hospital,
        record.fileUri ?? null, record.aiInsights ?? null,
        record.hash ?? null, record.notarized ? 1 : 0,
        record.supersedes ?? null,
        record.fhirResource ? JSON.stringify(record.fhirResource) : null,
        null, // patient_signature
        record.patientId ?? null,
      ]
    );
  },

  async delete(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      webDb.records = webDb.records.filter(r => r.id !== id);
      saveWebData();
      return;
    }
    await getDb().runAsync('DELETE FROM records WHERE id = ?', [id]);
  },

  async seed(records: Record[]): Promise<void> {
    for (const r of records) await RecordDB.insert(r);
  },
};

// ─── Appointments ──────────────────────────────────────────────────────────

export const AppointmentDB = {
  async getAll(patientId?: string): Promise<Appointment[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      return webDb.appointments
        .filter(a => a.patientId === patientId)
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY date ASC',
      [patientId]
    );
    return rows.map(mapAppointment);
  },

  async insert(appt: Appointment): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.appointments.findIndex(a => a.id === appt.id);
      if (idx !== -1) {
        webDb.appointments[idx] = appt;
      } else {
        webDb.appointments.push(appt);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      'INSERT OR REPLACE INTO appointments (id, doctor_name, specialty, date, time, status, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [appt.id, appt.doctorName, appt.specialty, appt.date, appt.time, appt.status, appt.patientId ?? null]
    );
  },

  async updateStatus(id: string, status: Appointment['status']): Promise<void> {
    if (Platform.OS === 'web') {
      const appt = webDb.appointments.find(a => a.id === id);
      if (appt) {
        appt.status = status;
        saveWebData();
      }
      return;
    }
    await getDb().runAsync('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      webDb.appointments = webDb.appointments.filter(a => a.id !== id);
      saveWebData();
      return;
    }
    await getDb().runAsync('DELETE FROM appointments WHERE id = ?', [id]);
  },

  async seed(appts: Appointment[]): Promise<void> {
    for (const a of appts) await AppointmentDB.insert(a);
  },
};

// ─── Blockchain Logs ────────────────────────────────────────────────────────

export const BlockchainLogDB = {
  async getAll(patientId?: string): Promise<BlockchainLog[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      return webDb.blockchain_logs
        .filter(l => l.patientId === patientId)
        .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
        .slice(0, 50);
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM blockchain_logs WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 50',
      [patientId]
    );
    return rows.map(mapLog);
  },

  async insert(log: BlockchainLog): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.blockchain_logs.findIndex(l => l.id === log.id);
      if (idx !== -1) {
        webDb.blockchain_logs[idx] = log;
      } else {
        webDb.blockchain_logs.push(log);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      'INSERT OR REPLACE INTO blockchain_logs (id, action, timestamp, details, tx_hash, patient_id) VALUES (?, ?, ?, ?, ?, ?)',
      [log.id, log.action, log.timestamp, log.details, log.txHash, log.patientId ?? null]
    );
  },

  async seed(logs: BlockchainLog[]): Promise<void> {
    for (const l of logs) await BlockchainLogDB.insert(l);
  },
};

// ─── Health Metrics ─────────────────────────────────────────────────────────

export const HealthMetricDB = {
  async getAll(patientId?: string): Promise<HealthMetric[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      return webDb.health_metrics
        .filter(m => m.patientId === patientId)
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM health_metrics WHERE patient_id = ? ORDER BY date ASC',
      [patientId]
    );
    return rows.map(mapMetric);
  },

  async insert(metric: HealthMetric): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.health_metrics.findIndex(m => m.id === metric.id);
      if (idx !== -1) {
        webDb.health_metrics[idx] = metric;
      } else {
        webDb.health_metrics.push(metric);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      'INSERT OR REPLACE INTO health_metrics (id, type, value, unit, date, patient_id) VALUES (?, ?, ?, ?, ?, ?)',
      [metric.id, metric.type, metric.value, metric.unit, metric.date, metric.patientId ?? null]
    );
  },

  async seed(metrics: HealthMetric[]): Promise<void> {
    for (const m of metrics) await HealthMetricDB.insert(m);
  },
};

// ─── Allergies ──────────────────────────────────────────────────────────────

export const AllergyDB = {
  async getAll(patientId?: string): Promise<Allergy[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      const severityOrder: { [key: string]: number } = { 'high': 3, 'medium': 2, 'low': 1 };
      return webDb.allergies
        .filter(a => a.patientId === patientId)
        .sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC',
      [patientId]
    );
    return rows.map(mapAllergy);
  },

  async insert(allergy: Allergy): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.allergies.findIndex(a => a.id === allergy.id);
      if (idx !== -1) {
        webDb.allergies[idx] = allergy;
      } else {
        webDb.allergies.push(allergy);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      'INSERT OR REPLACE INTO allergies (id, type, name, text_val, severity, reaction, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [allergy.id, allergy.type, allergy.name, null, allergy.severity, allergy.reaction, allergy.patientId ?? null]
    );
  },

  async delete(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      webDb.allergies = webDb.allergies.filter(a => a.id !== id);
      saveWebData();
      return;
    }
    await getDb().runAsync('DELETE FROM allergies WHERE id = ?', [id]);
  },

  async seed(allergies: Allergy[]): Promise<void> {
    for (const a of allergies) await AllergyDB.insert(a);
  },
};

// ─── Doctor Access Requests ─────────────────────────────────────────────────

export const DoctorAccessRequestDB = {
  async getAll(patientId?: string): Promise<DoctorAccessRequest[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      return webDb.doctor_access_requests
        .filter(r => r.patientId === patientId)
        .sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM doctor_access_requests WHERE patient_id = ? ORDER BY requested_at DESC',
      [patientId]
    );
    return rows.map(mapDoctorAccessRequest);
  },

  async getPending(patientId?: string): Promise<DoctorAccessRequest[]> {
    if (!patientId) return [];
    if (Platform.OS === 'web') {
      const nowStr = new Date().toISOString();
      return webDb.doctor_access_requests
        .filter(r => r.patientId === patientId && r.status === 'pending' && (!r.expiresAt || r.expiresAt > nowStr))
        .sort((a, b) => (b.requestedAt || '').localeCompare(a.requestedAt || ''));
    }
    const rows = await getDb().getAllAsync(
      `SELECT * FROM doctor_access_requests 
       WHERE patient_id = ? AND status = 'pending' AND (expires_at IS NULL OR expires_at > datetime('now'))
       ORDER BY requested_at DESC`,
      [patientId]
    );
    return rows.map(mapDoctorAccessRequest);
  },

  async insert(request: DoctorAccessRequest): Promise<void> {
    if (Platform.OS === 'web') {
      const idx = webDb.doctor_access_requests.findIndex(r => r.id === request.id);
      if (idx !== -1) {
        webDb.doctor_access_requests[idx] = request;
      } else {
        webDb.doctor_access_requests.push(request);
      }
      saveWebData();
      return;
    }
    await getDb().runAsync(
      `INSERT OR REPLACE INTO doctor_access_requests 
       (id, doctor_id, doctor_name, hospital, requested_at, status, expires_at, patient_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [request.id, request.doctorId, request.doctorName, request.hospital, request.requestedAt, request.status, request.expiresAt ?? null, request.patientId ?? null]
    );
  },

  async updateStatus(id: string, status: 'pending' | 'approved' | 'denied'): Promise<void> {
    if (Platform.OS === 'web') {
      const request = webDb.doctor_access_requests.find(r => r.id === id);
      if (request) {
        request.status = status;
        saveWebData();
      }
      return;
    }
    await getDb().runAsync(
      'UPDATE doctor_access_requests SET status = ? WHERE id = ?',
      [status, id]
    );
  },

  async delete(id: string): Promise<void> {
    if (Platform.OS === 'web') {
      webDb.doctor_access_requests = webDb.doctor_access_requests.filter(r => r.id !== id);
      saveWebData();
      return;
    }
    await getDb().runAsync('DELETE FROM doctor_access_requests WHERE id = ?', [id]);
  },
};

// ─── Record Amendments ──────────────────────────────────────────────────────

export const RecordAmendmentDB = {
  async getAmendmentsFor(originalRecordId: string): Promise<any[]> {
    if (Platform.OS === 'web') {
      return webDb.record_amendments
        .filter(a => a.original_record_id === originalRecordId)
        .sort((a, b) => b.amended_at.localeCompare(a.amended_at));
    }
    const rows = await getDb().getAllAsync(
      `SELECT * FROM record_amendments 
       WHERE original_record_id = ?
       ORDER BY amended_at DESC`,
      [originalRecordId]
    );
    return rows;
  },

  async recordAmendment(
    originalRecordId: string,
    amendedRecordId: string,
    reason: string,
    amendedBy: string
  ): Promise<void> {
    if (Platform.OS === 'web') {
      const id = `amendment_${Date.now()}`;
      webDb.record_amendments.push({
        id,
        original_record_id: originalRecordId,
        amended_record_id: amendedRecordId,
        amendment_reason: reason,
        amended_by: amendedBy,
        amended_at: new Date().toISOString(),
      });
      saveWebData();
      return;
    }
    const id = `amendment_${Date.now()}`;
    await getDb().runAsync(
      `INSERT INTO record_amendments 
       (id, original_record_id, amended_record_id, amendment_reason, amended_by, amended_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, originalRecordId, amendedRecordId, reason, amendedBy, new Date().toISOString()]
    );
  },
};

// ─── FHIR Resources ─────────────────────────────────────────────────────────

export const FHIRResourceDB = {
  async getForRecord(recordId: string): Promise<any[]> {
    if (Platform.OS === 'web') {
      return webDb.fhir_resources
        .filter(f => f.record_id === recordId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(f => ({ ...f, resource_data: f.resource_data }));
    }
    const rows = await getDb().getAllAsync(
      'SELECT * FROM fhir_resources WHERE record_id = ? ORDER BY created_at DESC',
      [recordId]
    );
    return rows.map((row: any) => ({
      ...row,
      resource_data: JSON.parse(row.resource_data),
    }));
  },

  async insert(recordId: string, resourceType: string, resourceData: any): Promise<void> {
    if (Platform.OS === 'web') {
      const id = `fhir_${recordId}_${Date.now()}`;
      webDb.fhir_resources.push({
        id,
        record_id: recordId,
        resource_type: resourceType,
        resource_data: resourceData,
        created_at: new Date().toISOString(),
      });
      saveWebData();
      return;
    }
    const id = `fhir_${recordId}_${Date.now()}`;
    await getDb().runAsync(
      `INSERT INTO fhir_resources (id, record_id, resource_type, resource_data, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, recordId, resourceType, JSON.stringify(resourceData), new Date().toISOString()]
    );
  },
};

// ─── Utility: Check if DB is seeded ─────────────────────────────────────────

export async function isSeeded(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return webDb.medications.length > 0;
  }
  const row = await getDb().getFirstAsync(
    'SELECT COUNT(*) as count FROM medications'
  );
  return (row?.count ?? 0) > 0;
}

// ─── Row Mappers ─────────────────────────────────────────────────────────────

function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    bloodType: row.blood_type ?? '',
    weight: row.weight ?? '',
    height: row.height ?? '',
    avatar: row.avatar ?? undefined,
  };
}

function mapMedication(row: any): Medication {
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency ?? undefined,
    time: row.time,
    status: row.status as Medication['status'],
    patientId: row.patient_id ?? undefined,
  };
}

function mapRecord(row: any): Record {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    type: row.type,
    doctor: row.doctor,
    hospital: row.hospital,
    fileUri: row.file_uri ?? undefined,
    aiInsights: row.ai_insights ?? undefined,
    hash: row.hash ?? undefined,
    notarized: row.notarized === 1,
    supersedes: row.supersedes ?? undefined,
    fhirResource: row.fhir_resource ? JSON.parse(row.fhir_resource) : undefined,
    patientId: row.patient_id ?? undefined,
  };
}

function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    date: row.date,
    time: row.time,
    status: row.status as Appointment['status'],
    patientId: row.patient_id ?? undefined,
  };
}

function mapLog(row: any): BlockchainLog {
  return {
    id: row.id,
    action: row.action,
    timestamp: row.timestamp,
    details: row.details,
    txHash: row.tx_hash,
    patientId: row.patient_id ?? undefined,
  };
}

function mapMetric(row: any): HealthMetric {
  return {
    id: row.id,
    type: row.type as HealthMetric['type'],
    value: row.value,
    unit: row.unit,
    date: row.date,
    patientId: row.patient_id ?? undefined,
  };
}

function mapAllergy(row: any): Allergy {
  return {
    id: row.id,
    type: row.type as Allergy['type'],
    name: row.name,
    severity: row.severity as Allergy['severity'],
    reaction: row.reaction,
    patientId: row.patient_id ?? undefined,
  };
}

function mapDoctorAccessRequest(row: any): DoctorAccessRequest {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    hospital: row.hospital,
    requestedAt: row.requested_at,
    status: row.status as DoctorAccessRequest['status'],
    expiresAt: row.expires_at ?? undefined,
    patientId: row.patient_id ?? undefined,
  };
}
