/**
 * MediChain Global Store — Zustand + SQLite
 *
 * Architecture:
 *  - Zustand holds in-memory state for fast UI reactivity.
 *  - Every write action ALSO persists to SQLite via DatabaseService.
 *  - On app startup, `loadFromDatabase()` replaces the default seed values
 *    with whatever is already saved in SQLite.
 */
import { create } from 'zustand';
import { User, Medication, Record, Appointment, BlockchainLog, HealthMetric, Allergy, DoctorAccessRequest } from '../types';
import {
  UserDB, MedicationDB, RecordDB, AppointmentDB,
  BlockchainLogDB, HealthMetricDB, AllergyDB, isSeeded,
} from '../services/database';

// ─── Default Seed Data ──────────────────────────────────────────────────────
// Used only on first install; SQLite takes over after that.

const SEED_USER: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'patient@medichain.sl',
  phone: '+232 76 000 001',
  bloodType: 'O+',
  weight: '75 kg',
  height: '180 cm',
};

const SEED_MEDICATIONS: Medication[] = [
  { id: 'm1', name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', time: '08:00 AM', status: 'taken' },
  { id: 'm2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '09:30 AM', status: 'pending' },
  { id: 'm3', name: 'Metformin', dosage: '850mg', frequency: 'With meals', time: '01:00 PM', status: 'pending' },
];

const SEED_RECORDS: Record[] = [
  { id: 'r1', title: 'Annual Health Checkup', date: '2023-12-15', type: 'General', doctor: 'Dr. Wilson', hospital: 'General Hospital' },
  { id: 'r2', title: 'Blood Test Report', date: '2024-01-20', type: 'Laboratory', doctor: 'Dr. Chen', hospital: 'City Lab' },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: 'a1', doctorName: 'Dr. Sarah Wilson', specialty: 'Cardiologist', date: '2024-05-10', time: '10:30 AM', status: 'upcoming' },
  { id: 'a2', doctorName: 'Dr. Michael Chen', specialty: 'Dermatologist', date: '2024-05-15', time: '02:00 PM', status: 'upcoming' },
];

const SEED_BLOCKCHAIN_LOGS: BlockchainLog[] = [
  { id: 'bl1', action: 'Identity Verified', timestamp: '2024-04-26 10:00', details: 'Node verified patient identity', txHash: '0x74a...8f2' },
  { id: 'bl2', action: 'Record Encrypted', timestamp: '2024-04-26 10:15', details: 'Medical report encrypted with patient public key', txHash: '0x8b2...1c9' },
];

const SEED_HEALTH_METRICS: HealthMetric[] = [
  { id: 'hm1', type: 'Glucose', value: 95, unit: 'mg/dL', date: '2024-04-20' },
  { id: 'hm2', type: 'Glucose', value: 102, unit: 'mg/dL', date: '2024-04-21' },
  { id: 'hm3', type: 'Glucose', value: 98, unit: 'mg/dL', date: '2024-04-22' },
  { id: 'hm4', type: 'Glucose', value: 115, unit: 'mg/dL', date: '2024-04-23' },
  { id: 'hm5', type: 'Glucose', value: 92, unit: 'mg/dL', date: '2024-04-24' },
  { id: 'hm6', type: 'Glucose', value: 88, unit: 'mg/dL', date: '2024-04-25' },
  { id: 'hm7', type: 'Glucose', value: 96, unit: 'mg/dL', date: '2024-04-26' },
];

const SEED_ALLERGIES: Allergy[] = [
  { id: 'al1', type: 'Drug', name: 'Penicillin', severity: 'High', reaction: 'Hives, Swelling' },
  { id: 'al2', type: 'Food', name: 'Peanuts', severity: 'Critical', reaction: 'Anaphylaxis' },
  { id: 'al3', type: 'Environmental', name: 'Pollen', severity: 'Low', reaction: 'Sneezing, Itchy Eyes' },
];

const SEED_ACCESS_REQUESTS: DoctorAccessRequest[] = [
  { id: 'req1', doctorId: 'doc1', doctorName: 'Dr. Aminata Diallo', hospital: 'Connaught Hospital', requestedAt: '2024-04-26 09:15', status: 'pending' }
];

// ─── Store Interface ────────────────────────────────────────────────────────

interface AppState {
  // DB state
  isDbReady: boolean;
  setDbReady: (ready: boolean) => void;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;

  // Health Data
  medications: Medication[];
  records: Record[];
  appointments: Appointment[];
  blockchainLogs: BlockchainLog[];
  healthMetrics: HealthMetric[];
  allergies: Allergy[];
  accessRequests: DoctorAccessRequest[];

  // Actions
  loadFromDatabase: () => Promise<void>;

  addRecord: (record: Record) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;

  addMedication: (med: Medication) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;
  updateMedicationStatus: (id: string, status: Medication['status']) => Promise<void>;

  addAppointment: (app: Appointment) => Promise<void>;
  removeAppointment: (id: string) => Promise<void>;

  addBlockchainLog: (log: BlockchainLog) => Promise<void>;

  addAllergy: (allergy: Allergy) => Promise<void>;
  removeAllergy: (id: string) => Promise<void>;
  
  approveAccessRequest: (id: string) => void;
  denyAccessRequest: (id: string) => void;

  // Settings
  isScanning: boolean;
  setIsScanning: (value: boolean) => void;

  // Rewards
  tokens: number;
  isDataSharingEnabled: boolean;
  setSharingEnabled: (value: boolean) => void;
  addTokens: (amount: number) => void;

  // Security
  isMfaEnabled: boolean;
  isBiometricsEnabled: boolean;
  setMfaEnabled: (value: boolean) => void;
  setBiometricsEnabled: (value: boolean) => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set, get) => ({
  // DB
  isDbReady: false,
  setDbReady: (isDbReady) => set({ isDbReady }),

  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    set({ user });
    if (user) UserDB.upsert(user).catch(console.error);
  },
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ user: null, isAuthenticated: false }),

  // Health data (start with seed; loadFromDatabase() replaces on startup)
  medications: SEED_MEDICATIONS,
  records: SEED_RECORDS,
  appointments: SEED_APPOINTMENTS,
  blockchainLogs: SEED_BLOCKCHAIN_LOGS,
  healthMetrics: SEED_HEALTH_METRICS,
  allergies: SEED_ALLERGIES,
  accessRequests: SEED_ACCESS_REQUESTS,

  // ── DB Loader ──────────────────────────────────────────────────────────
  loadFromDatabase: async () => {
    try {
      const alreadySeeded = await isSeeded();

      if (!alreadySeeded) {
        // First run — seed the database with default data
        await MedicationDB.seed(SEED_MEDICATIONS);
        await RecordDB.seed(SEED_RECORDS);
        await AppointmentDB.seed(SEED_APPOINTMENTS);
        await BlockchainLogDB.seed(SEED_BLOCKCHAIN_LOGS);
        await HealthMetricDB.seed(SEED_HEALTH_METRICS);
        await AllergyDB.seed(SEED_ALLERGIES);
        console.log('[DB] First run — seeded default data');
      }

      // Always load from DB into Zustand
      let [meds, records, appts, logs, metrics, allergies, user] = await Promise.all([
        MedicationDB.getAll(),
        RecordDB.getAll(),
        AppointmentDB.getAll(),
        BlockchainLogDB.getAll(),
        HealthMetricDB.getAll(),
        AllergyDB.getAll(),
        UserDB.get(),
      ]);

      // --- DYNAMIC DATA INJECTION ---
      // Fetch live data from the backend if available
      try {
        const { fetchPatientRecords, fetchAuditLogs } = require('../services/api');
        const liveRecords = await fetchPatientRecords('PAT-1'); // Currently hardcoded to patient 1 for demo
        const liveLogs = await fetchAuditLogs('PAT-1');
        
        if (liveRecords && liveRecords.length > 0) {
          records = liveRecords.map((r: any) => ({
            id: r.id || r.recordId || Math.random().toString(),
            title: r.type || r.recordType || 'Medical Record',
            date: r.date || r.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
            type: r.type || r.recordType || 'General',
            doctor: r.doctorId || 'Unknown Doctor',
            hospital: 'Hyperledger Fabric Network'
          }));
        }

        if (liveLogs && liveLogs.length > 0) {
          logs = liveLogs.map((l: any) => ({
            id: l.id || Math.random().toString(),
            action: l.action,
            timestamp: l.timestamp?.split('T').join(' ') || new Date().toISOString(),
            details: l.details,
            txHash: l.txHash || '0x...'
          }));
        }
      } catch (e) {
        console.log('Backend not reachable, falling back to local SQLite data.');
      }
      // ------------------------------

      set({
        medications: meds,
        records,
        appointments: appts,
        blockchainLogs: logs,
        healthMetrics: metrics,
        allergies,
        user: user ?? null,
        isDbReady: true,
      });

      console.log('[DB] Loaded all data from SQLite + Live Backend API');
    } catch (err) {
      console.error('[DB] Failed to load from database:', err);
      // Graceful fallback: keep seed data, mark db ready so app still shows
      set({ isDbReady: true });
    }
  },

  // ── Records ────────────────────────────────────────────────────────────
  addRecord: async (record) => {
    await RecordDB.insert(record);
    set((state) => ({ records: [record, ...state.records] }));
  },
  removeRecord: async (id) => {
    await RecordDB.delete(id);
    set((state) => ({ records: state.records.filter(r => r.id !== id) }));
  },

  // ── Medications ────────────────────────────────────────────────────────
  addMedication: async (med) => {
    await MedicationDB.insert(med);
    set((state) => ({ medications: [...state.medications, med] }));
  },
  removeMedication: async (id) => {
    await MedicationDB.delete(id);
    set((state) => ({ medications: state.medications.filter(m => m.id !== id) }));
  },
  updateMedicationStatus: async (id, status) => {
    await MedicationDB.updateStatus(id, status);
    set((state) => ({
      medications: state.medications.map(m => m.id === id ? { ...m, status } : m),
    }));
  },

  // ── Appointments ───────────────────────────────────────────────────────
  addAppointment: async (app) => {
    await AppointmentDB.insert(app);
    set((state) => ({ appointments: [...state.appointments, app] }));
  },
  removeAppointment: async (id) => {
    await AppointmentDB.delete(id);
    set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) }));
  },

  // ── Blockchain Logs ────────────────────────────────────────────────────
  addBlockchainLog: async (log) => {
    await BlockchainLogDB.insert(log);
    set((state) => ({ blockchainLogs: [log, ...state.blockchainLogs] }));
  },

  // ── Allergies ──────────────────────────────────────────────────────────
  addAllergy: async (allergy) => {
    await AllergyDB.insert(allergy);
    set((state) => ({ allergies: [...state.allergies, allergy] }));
  },
  removeAllergy: async (id) => {
    await AllergyDB.delete(id);
    set((state) => ({ allergies: state.allergies.filter(a => a.id !== id) }));
  },

  // ── Access Requests ────────────────────────────────────────────────────
  approveAccessRequest: (id) => {
    set((state) => ({
      accessRequests: state.accessRequests.map(r => r.id === id ? { ...r, status: 'approved' } : r)
    }));
  },
  denyAccessRequest: (id) => {
    set((state) => ({
      accessRequests: state.accessRequests.map(r => r.id === id ? { ...r, status: 'denied' } : r)
    }));
  },

  // ── Settings (not persisted in DB — can add later) ─────────────────────
  isScanning: false,
  setIsScanning: (isScanning) => set({ isScanning }),

  tokens: 1250,
  isDataSharingEnabled: false,
  setSharingEnabled: (isDataSharingEnabled) => set({ isDataSharingEnabled }),
  addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),

  isMfaEnabled: true,
  isBiometricsEnabled: true,
  setMfaEnabled: (isMfaEnabled) => set({ isMfaEnabled }),
  setBiometricsEnabled: (isBiometricsEnabled) => set({ isBiometricsEnabled }),
}));
