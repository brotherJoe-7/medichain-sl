import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from '../utils/secureStore';

const expoExtra = ((Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra) as any) || {};
const configuredApiBaseUrl = expoExtra.apiBaseUrl ?? process.env.API_BASE_URL ?? 'http://localhost:3000/api';

function normalizeBaseUrl(url: string) {
  let normalized = url.trim().replace(/\/+$|\s+/g, '');

  if (Platform.OS === 'android') {
    try {
      const parsed = new URL(normalized);
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        parsed.hostname = '10.0.2.2';
        normalized = parsed.toString().replace(/\/+$/, '');
      }
    } catch {
      // Keep original if parsing fails.
    }
  }

  return normalized;
}

const BASE_URL = normalizeBaseUrl(configuredApiBaseUrl);
console.log('📡 [API Service] Backend URL configured to:', BASE_URL);

export const API_BASE = BASE_URL;

export function buildApiUrl(path: string, params?: Record<string, string>) {
  const cleanPath = path.replace(/^\/+/g, '');
  const url = `${BASE_URL}/${cleanPath}`;
  if (!params || Object.keys(params).length === 0) return url;
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
}

export async function fetchPatientRecords(patientId: string) {
  try {
    const res = await fetch(buildApiUrl('records', { patientId }));
    if (!res.ok) throw new Error(`Network error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('API Fetch Records Warning:', error);
    return [];
  }
}

export async function fetchAuditLogs(actorId: string) {
  try {
    const res = await fetch(buildApiUrl('audit/log', { actorId }));
    if (!res.ok) throw new Error(`Network error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('API Fetch Audit Logs Warning:', error);
    return [];
  }
}

export async function fetchPatientDetails(patientId: string) {
  try {
    const res = await fetch(buildApiUrl(`patients/${patientId}`));
    if (!res.ok) throw new Error(`Network error ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn('API Fetch Patient Warning:', error);
    return null;
  }
}

export async function generateQrToken(userId: string) {
  try {
    const res = await fetch(buildApiUrl('qr/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to get QR token');
    return res.json();
  } catch (err) {
    console.warn('generateQrToken error', err);
    return null;
  }
}

export async function verifyQrToken(token: string, doctorId: string) {
  try {
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    const docToken = await SecureStore.getItemAsync('medichain_doctor_token');
    if (docToken) headers['Authorization'] = `Bearer ${docToken}`;
    const res = await fetch(buildApiUrl('qr/verify'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('QR verification failed');
    return res.json();
  } catch (err) {
    console.warn('verifyQrToken error', err);
    return null;
  }
}

export async function fetchWalletBalance(patientId: string) {
  try {
    const res = await fetch(buildApiUrl(`wallet/${patientId}`));
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return res.json();
  } catch (err) {
    console.warn('fetchWalletBalance error', err);
    return null;
  }
}
