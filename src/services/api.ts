import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

export async function fetchPatientRecords(patientId: string) {
  try {
    const res = await fetch(`${BASE_URL}/records?patientId=${patientId}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    console.error('API Fetch Records Error:', error);
    return [];
  }
}

export async function fetchAuditLogs(actorId: string) {
  try {
    const res = await fetch(`${BASE_URL}/audit/log?actorId=${actorId}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    console.error('API Fetch Audit Logs Error:', error);
    return [];
  }
}

export async function fetchPatientDetails(patientId: string) {
  try {
    const res = await fetch(`${BASE_URL}/patients/${patientId}`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (error) {
    console.error('API Fetch Patient Error:', error);
    return null;
  }
}
