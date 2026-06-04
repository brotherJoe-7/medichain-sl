import * as SecureStore from '../utils/secureStore';
import { buildApiUrl } from './api';

const KEYS = {
  TOKEN: 'medichain_doctor_token',
  DOCTOR_ID: 'medichain_doctor_id',
  DOCTOR_NAME: 'medichain_doctor_name',
} as const;

export interface DoctorAuthSession {
  token: string;
  doctorId: string;
  name: string;
}

export const DoctorAuthService = {
  login: async (id: string, password: string): Promise<DoctorAuthSession> => {
    const res = await fetch(buildApiUrl('auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Doctor login failed');
    }

    await Promise.all([
      SecureStore.setItemAsync(KEYS.TOKEN, data.token),
      SecureStore.setItemAsync(KEYS.DOCTOR_ID, data.doctorId),
      SecureStore.setItemAsync(KEYS.DOCTOR_NAME, data.name),
    ]);

    return data;
  },

  getToken: async (): Promise<string | null> => SecureStore.getItemAsync(KEYS.TOKEN),

  getDoctorId: async (): Promise<string | null> => SecureStore.getItemAsync(KEYS.DOCTOR_ID),

  getDoctorName: async (): Promise<string | null> => SecureStore.getItemAsync(KEYS.DOCTOR_NAME),

  logout: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.TOKEN),
      SecureStore.deleteItemAsync(KEYS.DOCTOR_ID),
      SecureStore.deleteItemAsync(KEYS.DOCTOR_NAME),
    ]);
  },
};
