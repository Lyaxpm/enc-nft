import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const WalletContext = createContext(null);

const OCTRA_RPC = import.meta.env.VITE_OCTRA_RPC_URL || 'http://46.101.86.250:8080';

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);

  // Check for Octra wallet extensions (0xio, OctWa, or generic octra)
  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.oxio) return window.oxio;
      if (window.octwa) return window.octwa;
      if (window.octra) return window.octra;
    }
    return null;
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const provider = getProvider();

      if (!provider) {
        toast.error('No Octra wallet detected. Please install 0xio or OctWa extension.');
        return;
      }

      const response = await provider.connect();
      const address = response.address || response.publicKey;

      setWallet({
        address,
        provider,
        publicKey: response.publicKey,
      });

      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [getProvider]);

  const disconnect = useCallback(() => {
    const provider = getProvider();
    if (provider && provider.disconnect) {
      provider.disconnect();
    }
    setWallet(null);
    setBalance(null);
    toast.success('Wallet disconnected');
  }, [getProvider]);

  const signMessage = useCallback(async (message) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!wallet.provider || !wallet.provider.signMessage) {
      throw new Error('Wallet does not support message signing');
    }
    return await wallet.provider.signMessage(message);
  }, [wallet]);

  const sendTransaction = useCallback(async (transaction) => {
    if (!wallet) throw new Error('Wallet not connected');
    if (!wallet.provider || !wallet.provider.signAndSendTransaction) {
      throw new Error('Wallet does not support transactions');
    }
    return await wallet.provider.signAndSendTransaction(transaction);
  }, [wallet]);

  // Fetch balance from RPC
  useEffect(() => {
    if (!wallet) return;

    const fetchBalance = async () => {
      try {
        if (wallet.provider && wallet.provider.getBalance) {
          const bal = await wallet.provider.getBalance();
          setBalance(bal);
        } else {
          const response = await fetch(OCTRA_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'get_balance',
              params: [wallet.address],
            }),
          }).catch(() => null);

          if (response && response.ok) {
            const data = await response.json();
            if (data.result) {
              const raw = parseInt(data.result.balance_raw || data.result || '0', 10);
              setBalance((raw / 1_000_000).toFixed(6));
            } else {
              setBalance('0');
            }
          } else {
            setBalance('0');
          }
        }
      } catch {
        setBalance('0');
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet]);

  const value = {
    wallet,
    isConnecting,
    balance,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
    isConnected: !!wallet,
    rpcUrl: OCTRA_RPC,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
