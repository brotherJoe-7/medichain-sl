// ─── MediChain Doctor Portal — Type Definitions ─────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;  // years
  rating: number;
  email: string;
  phone: string;
  walletAddress?: string;
  hospital: string;
  licenseNumber: string;
  avatar?: string;
  initials: string;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  condition: string;
  lastVisit: string;
  nextVisit?: string;
  status: 'Active' | 'Inactive' | 'Critical';
  walletAddress?: string;
  allergies: string[];
  medications: string[];
  notes?: string;
}

export type AppointmentStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'In Progress' | 'No-Show';
export type AppointmentType = 'In-Person' | 'Virtual' | 'Home Visit';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  patientAge: number;
  patientGender: string;
  date: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  category: string;
  status: AppointmentStatus;
  notes?: string;
  doctorName?: string;
  experience?: string;
  rating?: number;
}

export type RecordType = 'Lab Report' | 'Prescription' | 'X-Ray' | 'MRI' | 'Consultation Note' | 'Discharge Summary' | 'Vaccination' | 'Surgery Report';
export type SyncStatus = 'Synced' | 'Pending' | 'Failed' | 'Verifying';

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: RecordType;
  description: string;
  hash: string;
  txHash?: string;
  blockNumber?: number;
  status: SyncStatus;
  ipfsCid?: string;
  doctorSignature?: string;
  verified: boolean;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientInitials: string;
  requestedAt: string;
  expiresAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  recordTypes: string[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface BlockchainStatus {
  connected: boolean;
  walletAddress?: string;
  network?: string;
  balance?: string;
  lastSync?: string;
  pendingTx: number;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingReviews: number;
  syncRate: number;
  patientsTrend: number;
  appointmentsTrend: number;
}

export interface AnalyticsData {
  month: string;
  patients: number;
  appointments: number;
  records: number;
}

export interface DepartmentStat {
  name: string;
  percentage: number;
  color: string;
}
