// ─── MediChain API Service ────────────────────────────────────────────────────
// Single source of truth for all backend communication.
// Backend URL: http://localhost:3000

const BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('mc_doctor_jwt');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {}

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Health ───────────────────────────────────────────────────────────────────
export const checkHealth = () => request<{ status: string; blockchain: string }>('/health');

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  request<{ totalPatients: number; todayAppointments: number; pendingRecords: number; syncRate: number }>(
    '/dashboard/stats'
  );

// ─── Patients ─────────────────────────────────────────────────────────────────
export interface PatientPayload {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  condition: string;
  allergies: string[];
  medications: string[];
  notes: string;
  doctorId?: string;
}

export const getPatients = (doctorId = 'doctor_smith') =>
  request<PatientPayload[]>(`/patients?doctorId=${encodeURIComponent(doctorId)}`);

export const getPatient = (id: string) => request<PatientPayload>(`/patients/${id}`);

export const createPatient = (data: PatientPayload) =>
  request<{ success: boolean; patientId: string; txHash: string }>('/patients', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ─── Records ─────────────────────────────────────────────────────────────────
export interface RecordPayload {
  patientId: string;
  recordId: string;
  documentHash: string;
  ipfsHash?: string;
  recordType: string;
  doctorId?: string;
  patientSignature?: string;
}

export const getRecords = (patientId: string) =>
  request<any[]>(`/records?patientId=${encodeURIComponent(patientId)}`);

export const notarizeRecord = (data: RecordPayload) =>
  request<{ success: boolean; txHash: string; status: string }>('/records/notarize', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ─── Access Control ───────────────────────────────────────────────────────────
export const grantAccess = (patientId: string, doctorId: string) =>
  request<{ success: boolean; txHash: string }>('/access/grant', {
    method: 'POST',
    body: JSON.stringify({ patientId, doctorId }),
  });

export const revokeAccess = (patientId: string, doctorId: string) =>
  request<{ success: boolean; txHash: string }>('/access/revoke', {
    method: 'POST',
    body: JSON.stringify({ patientId, doctorId }),
  });

export const emergencyAccess = (patientId: string, doctorId: string) =>
  request<{ success: boolean; payload: any }>('/emergency/access', {
    method: 'POST',
    body: JSON.stringify({ patientId, doctorId }),
  });

export const verifyQr = (token: string, doctorId: string) =>
  request<{ success: boolean; payload: any }>('/qr/verify', {
    method: 'POST',
    body: JSON.stringify({ token, doctorId }),
  });
export interface DoctorLoginResponse {
  token: string;
  doctorId: string;
  name: string;
}

export const loginDoctor = (id: string, password: string) =>
  request<DoctorLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ id, password }),
  });
// ─── Audit Log ────────────────────────────────────────────────────────────────
export const getAuditLog = (actorId: string) =>
  request<any[]>(`/audit/log?actorId=${encodeURIComponent(actorId)}`);

// ─── IPFS Upload ──────────────────────────────────────────────────────────────
export const uploadToIPFS = async (file: File): Promise<{ hash: string; gateway: string; source: string }> => {
  const formData = new FormData();
  formData.append('document', file);
  const res = await fetch(`${BASE}/ipfs/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('IPFS upload failed');
  return res.json();
};
