/**
 * AuthService — Phase 5D
 *
 * Handles persistent, cryptographically-secure authentication:
 * - Tokens stored in expo-secure-store (hardware-backed keychain)
 * - Session validation on app launch
 * - Simulated JWT flow that is ready to plug in a real backend endpoint
 */

import * as SecureStore from '../utils/secureStore';
import { useStore } from '../store/useStore';
import { atob, btoa } from '../utils/base64';

// Keys used in SecureStore
const KEYS = {
  SESSION_TOKEN: 'medichain_session_token',
  USER_ID: 'medichain_user_id',
  USER_EMAIL: 'medichain_user_email',
  REFRESH_TOKEN: 'medichain_refresh_token',
} as const;

export interface AuthSession {
  userId: string;
  email: string;
  sessionToken: string;
  expiresAt: number; // Unix timestamp ms
}

// ─── Demo credentials (replace with real backend call) ───────────────────────
const DEMO_CREDENTIALS = {
  email: 'patient@medichain.sl',
  password: 'password123',
  userId: '1',
};

// ─── JWT-like token generation (replace with real JWT from server) ─────────
function generateSessionToken(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }));
  // In production this signature would be provided by the server
  const signature = btoa(`medichain_${userId}_${Date.now()}`);
  return `${header}.${payload}.${signature}`;
}

export const AuthService = {
  /**
   * Login — validates credentials and persists session to secure storage.
   * Replace the credential check here with a real API call in production.
   */
  login: async (email: string, password: string): Promise<AuthSession> => {
    // TODO: Replace with: const res = await APIClient.post('/auth/login', { email, password });
    await new Promise((r) => setTimeout(r, 800)); // Simulate network

    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail !== DEMO_CREDENTIALS.email ||
      password !== DEMO_CREDENTIALS.password
    ) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const sessionToken = generateSessionToken(DEMO_CREDENTIALS.userId, normalizedEmail);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Persist to hardware-backed keychain
    await Promise.all([
      SecureStore.setItemAsync(KEYS.SESSION_TOKEN, sessionToken),
      SecureStore.setItemAsync(KEYS.USER_ID, DEMO_CREDENTIALS.userId),
      SecureStore.setItemAsync(KEYS.USER_EMAIL, normalizedEmail),
    ]);

    return {
      userId: DEMO_CREDENTIALS.userId,
      email: normalizedEmail,
      sessionToken,
      expiresAt,
    };
  },

  /**
   * Restores session from secure storage on app launch.
   * Returns null if no valid session exists.
   */
  restoreSession: async (): Promise<AuthSession | null> => {
    try {
      const [token, userId, email] = await Promise.all([
        SecureStore.getItemAsync(KEYS.SESSION_TOKEN),
        SecureStore.getItemAsync(KEYS.USER_ID),
        SecureStore.getItemAsync(KEYS.USER_EMAIL),
      ]);

      if (!token || !userId || !email) return null;

      // Decode the payload to check expiry
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      const expMs = payload.exp * 1000;
      if (Date.now() > expMs) {
        // Token expired — clean up
        await AuthService.logout();
        return null;
      }

      return {
        userId,
        email,
        sessionToken: token,
        expiresAt: expMs,
      };
    } catch {
      return null;
    }
  },

  /**
   * Clears all session data from secure storage.
   */
  logout: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.SESSION_TOKEN),
      SecureStore.deleteItemAsync(KEYS.USER_ID),
      SecureStore.deleteItemAsync(KEYS.USER_EMAIL),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },

  /**
   * Returns the current stored token, or null.
   */
  getToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(KEYS.SESSION_TOKEN);
  },

  /**
   * Checks if a valid (non-expired) session is stored.
   */
  hasValidSession: async (): Promise<boolean> => {
    const session = await AuthService.restoreSession();
    return session !== null;
  },
};
