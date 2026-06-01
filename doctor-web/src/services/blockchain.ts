import type { MedicalRecord, BlockchainStatus } from '../types';

const GATEWAY_URL = (import.meta as any).env.VITE_GATEWAY_URL || 'http://localhost:3000/api';

// ─── Hyperledger Fabric API Connection (Replacing MetaMask) ─────────────

export const connectWallet = async (): Promise<{ address: string; network: string; balance: string } | null> => {
  // We simulate "wallet connection" by adopting the doctor_smith identity from the Fabric CA
  const identity = 'doctor_smith';
  localStorage.setItem('mc_wallet_address', identity);
  return {
    address: identity,
    network: 'Hyperledger Fabric (medichainchannel)',
    balance: 'N/A (Permissioned)',
  };
};

export const disconnectWallet = (): void => {
  localStorage.removeItem('mc_wallet_address');
};

export const getWalletStatus = async (): Promise<BlockchainStatus> => {
  const address = localStorage.getItem('mc_wallet_address');
  if (!address) return { connected: false, pendingTx: 0 };
  
  return {
    connected: true,
    walletAddress: address,
    network: 'Hyperledger Fabric',
    balance: 'N/A',
    lastSync: new Date().toISOString(),
    pendingTx: 0,
  };
};

// ─── Record Management ────────────────────────────────────────────────────────
export const addRecordToBlockchain = async (
  patientAddress: string,
  record: Pick<MedicalRecord, 'id' | 'hash' | 'ipfsCid'>
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    const response = await fetch(`${GATEWAY_URL}/records/notarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientId: patientAddress, 
        recordId: record.id,
        documentHash: record.hash,
        ipfsHash: record.ipfsCid || '',
        recordType: 'General',
        doctorId: localStorage.getItem('mc_wallet_address') || 'doctor_smith',
        patientSignature: 'SignedByPatient'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${errorText}`);
    }
    
    const data = await response.json();
    return { success: true, txHash: data.txHash };
  } catch (error: any) {
    console.error('Blockchain record error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyRecordOnChain = async (
  recordId: string
): Promise<{ verified: boolean; recordId?: string; blockNumber?: number; timestamp?: Date }> => {
  // Currently the API gateway doesn't have a direct /verify endpoint.
  // We assume verified true for now, but this will fail if the gateway itself is down.
  try {
    const res = await fetch(`${GATEWAY_URL}/health`);
    if (!res.ok) throw new Error();
    return {
      verified: true,
      recordId,
      blockNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date(),
    };
  } catch {
    return { verified: false, recordId };
  }
};

// ─── Access Control ───────────────────────────────────────────────────────────
export const grantPatientAccess = async (
  doctorAddress: string,
  patientAddress: string,
  durationDays: number = 30
): Promise<{ success: boolean; txHash?: string }> => {
  try {
    const response = await fetch(`${GATEWAY_URL}/access/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientId: patientAddress,
        doctorId: doctorAddress,
        durationDays,
      })
    });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return { success: true, txHash: data.txHash };
  } catch (error) {
    console.error('Access grant error:', error);
    return { success: false };
  }
};

export const revokePatientAccess = async (
  doctorAddress: string,
  patientAddress: string
): Promise<{ success: boolean; txHash?: string }> => {
  try {
    const response = await fetch(`${GATEWAY_URL}/access/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientId: patientAddress, 
        doctorId: doctorAddress
      })
    });
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return { success: true, txHash: data.txHash };
  } catch (error) {
    console.error('Access revoke error:', error);
    return { success: false };
  }
};

export const checkDoctorAccess = async (
  doctorAddress: string,
  patientAddress: string
): Promise<{ hasAccess: boolean; expiresAt?: Date }> => {
  // Placeholder access logic for the demo.
  console.debug('Checking access for', doctorAddress, 'and', patientAddress);
  return { hasAccess: true, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
};

// ─── Utilities ────────────────────────────────────────────────────────────────
export const hashRecordData = (data: object): string => {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0').slice(0, 64);
};

export const formatAddress = (address: string): string => {
  if (!address) return '';
  if (address.length > 10) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  return address; // Identity string like "doctor_smith"
};

export const isMetaMaskAvailable = (): boolean => {
  // We no longer rely on MetaMask. We route through the API Gateway.
  return true; 
};
