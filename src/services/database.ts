/**
 * MediChain Database Service
 * Built on expo-sqlite v16 (async API)
 *
 * This service is the single source of truth for all persisted data.
 * Zustand reads from here on startup and writes here on every mutation.
 */
import * as SQLite from 'expo-sqlite';
import { User, Medication, Record, Appointment, BlockchainLog, HealthMetric, Allergy, DoctorAccessRequest } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

// ─── Initialise ────────────────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
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

function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await getDb().getAllAsync<any>(`PRAGMA table_info(${table})`);
  return rows.some((row: any) => row.name === column);
}

async function migratePatientColumns(): Promise<void> {
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
    const row = await getDb().getFirstAsync<any>('SELECT * FROM users LIMIT 1');
    if (!row) return null;
    return mapUser(row);
  },

  async getById(id: string): Promise<User | null> {
    const row = await getDb().getFirstAsync<any>('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;
    return mapUser(row);
  },

  async upsert(user: User): Promise<void> {
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
    await getDb().runAsync('DELETE FROM users WHERE id = ?', [id]);
  },
};

// ─── Medications ────────────────────────────────────────────────────────────

export const MedicationDB = {
  async getAll(patientId?: string): Promise<Medication[]> {
    if (!patientId) return [];
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM medications WHERE patient_id = ? ORDER BY time ASC',
      [patientId]
    );
    return rows.map(mapMedication);
  },

  async insert(med: Medication): Promise<void> {
    await getDb().runAsync(
      'INSERT OR REPLACE INTO medications (id, name, dosage, frequency, time, status, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [med.id, med.name, med.dosage, med.frequency ?? null, med.time, med.status, med.patientId ?? null]
    );
  },

  async updateStatus(id: string, status: Medication['status']): Promise<void> {
    await getDb().runAsync('UPDATE medications SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id: string): Promise<void> {
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
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM records WHERE patient_id = ? ORDER BY date DESC',
      [patientId]
    );
    return rows.map(mapRecord);
  },

  async insert(record: Record): Promise<void> {
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
        null, // patient_signature - populated via signRecord
        record.patientId ?? null,
      ]
    );
  },

  async delete(id: string): Promise<void> {
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
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY date ASC',
      [patientId]
    );
    return rows.map(mapAppointment);
  },

  async insert(appt: Appointment): Promise<void> {
    await getDb().runAsync(
      'INSERT OR REPLACE INTO appointments (id, doctor_name, specialty, date, time, status, patient_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [appt.id, appt.doctorName, appt.specialty, appt.date, appt.time, appt.status, appt.patientId ?? null]
    );
  },

  async updateStatus(id: string, status: Appointment['status']): Promise<void> {
    await getDb().runAsync('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  },

  async delete(id: string): Promise<void> {
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
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM blockchain_logs WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 50',
      [patientId]
    );
    return rows.map(mapLog);
  },

  async insert(log: BlockchainLog): Promise<void> {
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
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM health_metrics WHERE patient_id = ? ORDER BY date ASC',
      [patientId]
    );
    return rows.map(mapMetric);
  },

  async insert(metric: HealthMetric): Promise<void> {
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
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC',
      [patientId]
    );
    return rows.map(mapAllergy);
  },

  async insert(allergy: Allergy): Promise<void> {
    await getDb().runAsync(
      'INSERT OR REPLACE INTO allergies (id, type, name, severity, reaction, patient_id) VALUES (?, ?, ?, ?, ?, ?)',
      [allergy.id, allergy.type, allergy.name, allergy.severity, allergy.reaction, allergy.patientId ?? null]
    );
  },

  async delete(id: string): Promise<void> {
    await getDb().runAsync('DELETE FROM allergies WHERE id = ?', [id]);
  },

  async seed(allergies: Allergy[]): Promise<void> {
    for (const a of allergies) await AllergyDB.insert(a);
  },
};

// ─── Doctor Access Requests (GAP 5) ─────────────────────────────────────────

export const DoctorAccessRequestDB = {
  async getAll(patientId?: string): Promise<DoctorAccessRequest[]> {
    if (!patientId) return [];
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM doctor_access_requests WHERE patient_id = ? ORDER BY requested_at DESC',
      [patientId]
    );
    return rows.map(mapDoctorAccessRequest);
  },

  async getPending(patientId?: string): Promise<DoctorAccessRequest[]> {
    if (!patientId) return [];
    const rows = await getDb().getAllAsync<any>(
      `SELECT * FROM doctor_access_requests 
       WHERE patient_id = ? AND status = 'pending' AND (expires_at IS NULL OR expires_at > datetime('now'))
       ORDER BY requested_at DESC`,
      [patientId]
    );
    return rows.map(mapDoctorAccessRequest);
  },

  async insert(request: DoctorAccessRequest): Promise<void> {
    await getDb().runAsync(
      `INSERT OR REPLACE INTO doctor_access_requests 
       (id, doctor_id, doctor_name, hospital, requested_at, status, expires_at, patient_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [request.id, request.doctorId, request.doctorName, request.hospital, request.requestedAt, request.status, null, request.patientId ?? null]
    );
  },

  async updateStatus(id: string, status: 'pending' | 'approved' | 'denied'): Promise<void> {
    await getDb().runAsync(
      'UPDATE doctor_access_requests SET status = ? WHERE id = ?',
      [status, id]
    );
  },

  async delete(id: string): Promise<void> {
    await getDb().runAsync('DELETE FROM doctor_access_requests WHERE id = ?', [id]);
  },
};

// ─── Record Amendments (GAP 8) ──────────────────────────────────────────────

export const RecordAmendmentDB = {
  async getAmendmentsFor(originalRecordId: string): Promise<any[]> {
    const rows = await getDb().getAllAsync<any>(
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
    const id = `amendment_${Date.now()}`;
    await getDb().runAsync(
      `INSERT INTO record_amendments 
       (id, original_record_id, amended_record_id, amendment_reason, amended_by, amended_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, originalRecordId, amendedRecordId, reason, amendedBy, new Date().toISOString()]
    );
  },
};

// ─── FHIR Resources (GAP 6) ─────────────────────────────────────────────────

export const FHIRResourceDB = {
  async getForRecord(recordId: string): Promise<any[]> {
    const rows = await getDb().getAllAsync<any>(
      'SELECT * FROM fhir_resources WHERE record_id = ? ORDER BY created_at DESC',
      [recordId]
    );
    return rows.map((row: any) => ({
      ...row,
      resource_data: JSON.parse(row.resource_data),
    }));
  },

  async insert(recordId: string, resourceType: string, resourceData: any): Promise<void> {
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
  const row = await getDb().getFirstAsync<{ count: number }>(
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
    patientId: row.patient_id ?? undefined,
  };
}
