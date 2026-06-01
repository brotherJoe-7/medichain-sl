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
import { ThemeKey } from '../theme';
import {
  UserDB, MedicationDB, RecordDB, AppointmentDB,
  BlockchainLogDB, HealthMetricDB, AllergyDB, isSeeded,
} from '../services/database';
import { fetchPatientRecords, fetchAuditLogs } from '../services/api';
import { fetchWalletBalance } from '../services/api';


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
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
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

  themeChoice: ThemeKey;
  setThemeChoice: (themeChoice: ThemeKey) => void;
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

  // Health data starts empty; data is loaded from SQLite when available.
  medications: [],
  records: [],
  appointments: [],
  blockchainLogs: [],
  healthMetrics: [],
  allergies: [],
  accessRequests: [],

  // ── DB Loader ──────────────────────────────────────────────────────────
  loadFromDatabase: async () => {
    try {
      const alreadySeeded = await isSeeded();

      if (!alreadySeeded) {
        // First run — no sample data seeded yet.
        console.log('[DB] First run — starting with an empty patient dataset.');
      }

      // Always load from DB into Zustand
      const user = await UserDB.get();
      const patientId = user?.id;

      let [meds, records, appts, logs, metrics, allergies] = await Promise.all([
        MedicationDB.getAll(patientId),
        RecordDB.getAll(patientId),
        AppointmentDB.getAll(patientId),
        BlockchainLogDB.getAll(patientId),
        HealthMetricDB.getAll(patientId),
        AllergyDB.getAll(patientId),
      ]);

      // --- DYNAMIC DATA INJECTION ---
      // Fetch live data from the backend only for an authenticated user.
      try {
        if (patientId) {
          const liveRecords = await fetchPatientRecords(patientId);
          const liveLogs = await fetchAuditLogs(patientId);

          if (liveRecords && liveRecords.length > 0) {
            records = liveRecords.map((r: any) => ({
              id: r.id || r.recordId || Math.random().toString(),
              title: r.title || r.recordType || 'Medical Record',
              date: r.date || r.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
              type: r.type || r.recordType || 'General',
              doctor: r.doctor || r.doctorId || 'Unknown Doctor',
              hospital: r.hospital || 'Hyperledger Fabric Network',
              hash: r.documentHash || r.hash || '',
              fileUri: r.ipfsHash ? `https://ipfs.io/ipfs/${r.ipfsHash}` : '',
              aiInsights: r.aiInsights || '',
              notarized: true,
              patientId,
            }));
          }

          if (liveLogs && liveLogs.length > 0) {
            logs = liveLogs.map((l: any) => ({
              id: l.id || Math.random().toString(),
              action: l.action,
              timestamp: l.timestamp?.split('T').join(' ') || new Date().toISOString(),
              details: l.details,
              txHash: l.txHash || '0x...',
              patientId,
            }));
          }
        } else {
          console.log('[DB] No authenticated user present; skipping live record fetch.');
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

      console.log('[DB] Loaded local SQLite data and opened secure vault.');

      if (patientId) {
        (async () => {
          try {
            const [liveRecords, liveLogs] = await Promise.all([
              fetchPatientRecords(patientId),
              fetchAuditLogs(patientId),
            ]);

            let updatedRecords = records;
            let updatedLogs = logs;

            if (liveRecords && liveRecords.length > 0) {
              updatedRecords = liveRecords.map((r: any) => ({
                id: r.id || r.recordId || Math.random().toString(),
                title: r.title || r.recordType || 'Medical Record',
                date: r.date || r.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0],
                type: r.type || r.recordType || 'General',
                doctor: r.doctor || r.doctorId || 'Unknown Doctor',
                hospital: r.hospital || 'Hyperledger Fabric Network',
                hash: r.documentHash || r.hash || '',
                fileUri: r.ipfsHash ? `https://ipfs.io/ipfs/${r.ipfsHash}` : '',
                aiInsights: r.aiInsights || '',
                notarized: true,
                patientId,
              }));
            }

            if (liveLogs && liveLogs.length > 0) {
              updatedLogs = liveLogs.map((l: any) => ({
                id: l.id || Math.random().toString(),
                action: l.action,
                timestamp: l.timestamp?.split('T').join(' ') || new Date().toISOString(),
                details: l.details,
                txHash: l.txHash || '0x...',
                patientId,
              }));
            }

            if (updatedRecords !== records || updatedLogs !== logs) {
              set({ records: updatedRecords, blockchainLogs: updatedLogs });
              console.log('[DB] Background sync refreshed records and audit logs.');
            }

            // Fetch wallet balance from backend (blockchain) if available
            try {
              const walletRes = await fetchWalletBalance(patientId);
              if (walletRes && typeof walletRes.balance === 'number') {
                set({ tokens: walletRes.balance });
              }
            } catch (e) {
              // Ignore wallet fetch failures — keep local state
            }
          } catch (e) {
            console.log('Backend not reachable, continuing with local SQLite data.');
          }
        })();
      } else {
        console.log('[DB] No authenticated user present; skipping live record fetch.');
      }
    } catch (err) {
      console.error('[DB] Failed to load from database:', err);
      // Graceful fallback: keep seed data, mark db ready so app still shows
      set({ isDbReady: true });
    }
  },

  // ── Records ────────────────────────────────────────────────────────────
  addRecord: async (record) => {
    const patientId = get().user?.id;
    const recordWithPatient = { ...record, patientId };
    await RecordDB.insert(recordWithPatient);
    set((state) => ({ records: [recordWithPatient, ...state.records] }));
  },
  removeRecord: async (id) => {
    await RecordDB.delete(id);
    set((state) => ({ records: state.records.filter(r => r.id !== id) }));
  },

  // ── Medications ────────────────────────────────────────────────────────
  addMedication: async (med) => {
    const patientId = get().user?.id;
    const medWithPatient = { ...med, patientId };
    await MedicationDB.insert(medWithPatient);
    set((state) => ({ medications: [...state.medications, medWithPatient] }));
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
    const patientId = get().user?.id;
    const appWithPatient = { ...app, patientId };
    await AppointmentDB.insert(appWithPatient);
    set((state) => ({ appointments: [...state.appointments, appWithPatient] }));
  },
  updateAppointmentStatus: async (id, status) => {
    await AppointmentDB.updateStatus(id, status);
    set((state) => ({
      appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a),
    }));
  },
  removeAppointment: async (id) => {
    await AppointmentDB.delete(id);
    set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) }));
  },

  // ── Blockchain Logs ────────────────────────────────────────────────────
  addBlockchainLog: async (log) => {
    const patientId = get().user?.id;
    const logWithPatient = { ...log, patientId };
    await BlockchainLogDB.insert(logWithPatient);
    set((state) => ({ blockchainLogs: [logWithPatient, ...state.blockchainLogs] }));
  },

  // ── Allergies ──────────────────────────────────────────────────────────
  addAllergy: async (allergy) => {
    const patientId = get().user?.id;
    const allergyWithPatient = { ...allergy, patientId };
    await AllergyDB.insert(allergyWithPatient);
    set((state) => ({ allergies: [...state.allergies, allergyWithPatient] }));
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

  // Tokens are a mock reward balance (MTK). Default to 0 in production.
  tokens: 0,
  isDataSharingEnabled: false,
  setSharingEnabled: (isDataSharingEnabled) => set({ isDataSharingEnabled }),
  addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),

  isMfaEnabled: true,
  isBiometricsEnabled: true,
  setMfaEnabled: (isMfaEnabled) => set({ isMfaEnabled }),
  setBiometricsEnabled: (isBiometricsEnabled) => set({ isBiometricsEnabled }),

  themeChoice: 'classic',
  setThemeChoice: (themeChoice) => set({ themeChoice }),
}));
