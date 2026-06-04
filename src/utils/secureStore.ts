import { Platform } from 'react-native';
import * as ExpoSecureStore from 'expo-secure-store';

export async function isAvailableAsync(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await ExpoSecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getItemAsync(key: string, options?: any): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return ExpoSecureStore.getItemAsync(key, options);
}

export async function setItemAsync(key: string, value: string, options?: any): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[SecureStore Polyfill] LocalStorage write error:', e);
    }
    return;
  }
  return ExpoSecureStore.setItemAsync(key, value, options);
}

export async function deleteItemAsync(key: string, options?: any): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[SecureStore Polyfill] LocalStorage delete error:', e);
    }
    return;
  }
  return ExpoSecureStore.deleteItemAsync(key, options);
}
