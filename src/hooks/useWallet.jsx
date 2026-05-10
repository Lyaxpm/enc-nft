import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const WalletContext = createContext(null);

const OCTRA_DEVNET_RPC = 'https://rpc.devnet.octra.org/rpc';

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);

  // Check if 0xio wallet extension is available
  const getProvider = useCallback(() => {
    if (typeof window !== 'undefined') {
      // Check for 0xio wallet
      if (window.oxio) return window.oxio;
      // Check for OctWa wallet
      if (window.octwa) return window.octwa;
      // Check generic octra provider
      if (window.octra) return window.octra;
    }
    return null;
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const provider = getProvider();
      
      if (provider) {
        // Real wallet connection via browser extension
        const response = await provider.connect();
        const address = response.address || response.publicKey;
        
        setWallet({
          address,
          provider,
          publicKey: response.publicKey,
        });

        toast.success('Wallet connected!');
      } else {
        // Demo mode - generate a simulated wallet for development
        const { generateDemoWallet } = await import('../utils/demoWallet');
        const demoWallet = generateDemoWallet();
        
        setWallet({
          address: demoWallet.address,
          provider: null,
          publicKey: demoWallet.publicKey,
          isDemo: true,
          keyPair: demoWallet.keyPair,
        });

        toast.success('Connected in Demo Mode (No wallet extension detected)');
      }
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

    if (wallet.provider && wallet.provider.signMessage) {
      return await wallet.provider.signMessage(message);
    }

    // Demo mode signing
    if (wallet.isDemo && wallet.keyPair) {
      const nacl = await import('tweetnacl');
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      const signature = nacl.default.sign.detached(messageBytes, wallet.keyPair.secretKey);
      return signature;
    }

    throw new Error('Signing not available');
  }, [wallet]);

  const sendTransaction = useCallback(async (transaction) => {
    if (!wallet) throw new Error('Wallet not connected');

    if (wallet.provider && wallet.provider.signAndSendTransaction) {
      return await wallet.provider.signAndSendTransaction(transaction);
    }

    // Demo mode - simulate transaction
    if (wallet.isDemo) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      const txHash = '0x' + Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      return { hash: txHash, status: 'confirmed' };
    }

    throw new Error('Transaction sending not available');
  }, [wallet]);

  // Fetch balance
  useEffect(() => {
    if (!wallet) return;

    const fetchBalance = async () => {
      try {
        if (wallet.provider && wallet.provider.getBalance) {
          const bal = await wallet.provider.getBalance();
          setBalance(bal);
        } else {
          // Demo mode or RPC fallback
          const response = await fetch(OCTRA_DEVNET_RPC, {
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
            setBalance(data.result || '0');
          } else {
            setBalance('1000.00'); // Demo balance
          }
        }
      } catch {
        setBalance('1000.00'); // Fallback demo balance
      }
    };

    fetchBalance();
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
    rpcUrl: OCTRA_DEVNET_RPC,
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
