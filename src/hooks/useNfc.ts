import { Platform } from 'react-native';

let NfcManager: any = null;

// Only try to load NFC on native platforms (iOS/Android)
if (Platform.OS !== 'web') {
  try {
    const nfcModuleName = 'react-native-nfc-manager';
    // Hidden require to avoid Metro static resolution on unsupported paths
    // and to make NFC optional during Expo bundling.
    NfcManager = require(nfcModuleName)?.default ?? null;
    } catch (e: any) {
    console.warn('NFC not available:', e?.message ?? e);
    NfcManager = null;
  }
}

function bytesToText(bytes: number[]) {
  if (!bytes || bytes.length === 0) return '';
  const statusByte = bytes[0];
  const languageCodeLength = statusByte & 0x3f;
  const textBytes = bytes.slice(1 + languageCodeLength);
  return String.fromCharCode(...textBytes);
}

function stringToUtf8Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      i++;
      const nextCode = str.charCodeAt(i);
      const utf32 = 0x10000 + (((code & 0x3ff) << 10) | (nextCode & 0x3ff));
      bytes.push(
        0xf0 | (utf32 >> 18),
        0x80 | ((utf32 >> 12) & 0x3f),
        0x80 | ((utf32 >> 6) & 0x3f),
        0x80 | (utf32 & 0x3f)
      );
    }
  }
  return bytes;
}

export function useNfc() {
  const available = !!NfcManager;

  async function start() {
    if (!NfcManager) return false;
    try {
      await NfcManager.start();
      return true;
    } catch (e) {
      return false;
    }
  }

  async function writeToken(token: string) {
    if (!NfcManager) throw new Error('NFC not available');
    try {
      await NfcManager.start();
      const bytes = NfcManager.stringToBytes ? NfcManager.stringToBytes(token) : stringToUtf8Bytes(token);
      const ndefRecord = NfcManager.Ndef?.textRecord
        ? NfcManager.Ndef.textRecord(token)
        : { tnf: NfcManager.Ndef.TNF_WELL_KNOWN, type: NfcManager.Ndef.RTD_TEXT, payload: bytes };
      await NfcManager.requestTechnology(NfcManager.NdefTech);
      await NfcManager.writeNdefMessage([ndefRecord]);
      await NfcManager.cancelTechnologyRequest();
      return true;
    } catch (e) {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {}
      throw e;
    }
  }

  async function readToken(timeout = 15000) {
    if (!NfcManager) throw new Error('NFC not available');
    await NfcManager.start();

    let canceled = false;
    const cleanup = async () => {
      try {
        await NfcManager.unregisterTagEvent();
      } catch {}
    };

    try {
      const tag: any = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          canceled = true;
          cleanup().finally(() => reject(new Error('NFC read timed out')));
        }, timeout);

        NfcManager.registerTagEvent((discoveredTag: any) => {
          if (canceled) return;
          clearTimeout(timer);
          resolve(discoveredTag);
        }, 'Hold your device close to the patient NFC tag').catch(reject);
      });

      if (!tag || !tag.ndefMessage || !tag.ndefMessage.length) return null;
      const record = tag.ndefMessage[0];
      const payload = record.payload || record.data || [];
      const tokenString = Array.isArray(payload)
        ? bytesToText(payload)
        : typeof payload === 'string'
        ? payload
        : '';
      await cleanup();
      return tokenString || null;
    } catch (e) {
      await cleanup();
      throw e;
    }
  }

  return { available, start, writeToken, readToken };
}
