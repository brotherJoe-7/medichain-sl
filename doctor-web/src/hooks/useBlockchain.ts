import { useState, useEffect, useCallback } from 'react';
import { connectWallet, disconnectWallet, getWalletStatus, isMetaMaskAvailable } from '../services/blockchain';
import type { BlockchainStatus } from '../types';

export const useBlockchain = () => {
  const [status, setStatus] = useState<BlockchainStatus>({ connected: false, pendingTx: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    const s = await getWalletStatus();
    setStatus(s);
    if (s.walletAddress) localStorage.setItem('mc_wallet_address', s.walletAddress);
  }, []);

  useEffect(() => {
    checkStatus();
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.on('accountsChanged', checkStatus);
      ethereum.on('chainChanged', checkStatus);
      return () => {
        ethereum.removeListener('accountsChanged', checkStatus);
        ethereum.removeListener('chainChanged', checkStatus);
      };
    }
  }, [checkStatus]);

  const connect = async () => {
    if (!isMetaMaskAvailable()) {
      setError('MetaMask not installed. Please install the MetaMask browser extension.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await connectWallet();
      if (result) {
        setStatus({ connected: true, walletAddress: result.address, network: result.network, balance: result.balance, pendingTx: 0 });
        localStorage.setItem('mc_wallet_address', result.address);
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } catch {
      setError('Connection rejected. Please approve in MetaMask.');
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    disconnectWallet();
    setStatus({ connected: false, pendingTx: 0 });
  };

  return { status, loading, error, connect, disconnect, refresh: checkStatus };
};
