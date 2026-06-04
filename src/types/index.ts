export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  weight: string;
  height: string;
  avatar?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency?: string; // BUG FIX #4: was missing, caused runtime crash in MedicationsScreen
  status: 'pending' | 'taken' | 'skipped';
  patientId?: string;
}

export interface Record {
  id: string;
  title: string;
  date: string;
  type: string;
  doctor: string;
  hospital: string;
  fileUri?: string;
  aiInsights?: string;
  hash?: string;        // BUG FIX #3: added for blockchain notarization
  notarized?: boolean;  // BUG FIX #3: added for blockchain notarization
  supersedes?: string;  // ARCHITECTURE GAP #8: Points to the ID of the record this one amends
  fhirResource?: any;   // ARCHITECTURE GAP #6: HL7 FHIR R4 raw resource data
  patientId?: string;
}

// ARCHITECTURE GAP #5: Async Doctor Access Requests
export interface DoctorAccessRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  hospital: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'denied';
  expiresAt?: string;
  patientId?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  patientId?: string;
}

export interface BlockchainLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  txHash: string;
  patientId?: string;
}

export interface HealthMetric {
  id: string;
  type: 'Glucose' | 'Blood Pressure' | 'Heart Rate' | 'Weight';
  value: number;
  unit: string;
  date: string;
  patientId?: string;
}

// BUG FIX #11: New Allergy type — was completely missing
export interface Allergy {
  id: string;
  type: 'Drug' | 'Food' | 'Environmental' | 'Other';
  name: string;
  severity: 'Low' | 'High' | 'Critical';
  reaction: string;
  patientId?: string;
}
