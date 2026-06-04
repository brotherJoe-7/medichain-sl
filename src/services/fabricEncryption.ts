/**
 * src/services/fabricEncryption.ts
 * 
 * Utility service for encrypting PII and medical records before 
 * they are uploaded to IPFS or sent to the Hyperledger Fabric network.
 */

// Note: In a real React Native environment, use libraries like 
// react-native-crypto, react-native-aes-gcm-crypto, or expo-crypto 
// for secure encryption. This is a simplified service structure.

import * as Crypto from 'expo-crypto';
import { btoa } from '../utils/base64';

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

export class FabricEncryptionService {
  /**
   * Generates a secure symmetric key for encrypting medical records.
   * This key should be encrypted with the recipient's public key (e.g., Doctor's public key)
   * before sharing.
   */
  static async generateSymmetricKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    // Convert to base64 for storage/usage
    const binString = String.fromCharCode(...new Uint8Array(randomBytes));
    return btoa(binString);
  }

  /**
   * Encrypts a medical document or text payload before sending to IPFS.
   * 
   * @param payload The data to encrypt (base64 or string)
   * @param symmetricKey The AES key
   * @returns The encrypted payload and initialization vector (IV)
   */
  static async encryptPayload(payload: string, symmetricKey: string): Promise<{ encrypted: string; iv: string }> {
    // Placeholder: Implement actual AES-GCM encryption here
    // e.g., using react-native-aes-gcm-crypto
    
    // Simulating encryption process
    const iv = await Crypto.getRandomBytesAsync(12);
    
    // Convert payload string to safe base64
    const utf8Bytes = stringToUtf8Bytes(payload);
    const binString = String.fromCharCode(...utf8Bytes);
    const simulatedEncryptedData = btoa(binString);
    
    const ivBinString = String.fromCharCode(...new Uint8Array(iv));
    
    return {
      encrypted: `ENC_FABRIC_${simulatedEncryptedData}`,
      iv: btoa(ivBinString),
    };
  }

  /**
   * Generates a deterministic SHA-256 hash of the unencrypted file.
   * This hash is stored on the Hyperledger Fabric ledger to prove data integrity
   * without revealing the actual contents.
   * 
   * @param payload The original data
   * @returns The SHA-256 hash
   */
  static async generateLedgerHash(payload: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      payload
    );
    return hash;
  }
}
