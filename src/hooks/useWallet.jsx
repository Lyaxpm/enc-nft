import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { OctraSDK } from '@octwa/sdk';

const WalletContext = createContext(null);

const OCTRA_RPC = import.meta.env.VITE_OCTRA_RPC_URL || 'http://46.101.86.250:8080';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const APP_CIRCLE = 'secretmint_nft_v1';

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState(null);
  const sdkRef = useRef(null);
  const capRef = useRef(null);

  const getSDK = useCallback(async () => {
    if (!sdkRef.current) {
      sdkRef.current = await OctraSDK.init({ timeout: 5000 });
    }
    return sdkRef.current;
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const sdk = await getSDK();

      if (!sdk.isInstalled()) {
        toast.error('OctWa wallet not detected. Please install the OctWa extension.');
        return;
      }

      const connection = await sdk.connect({
        circle: APP_CIRCLE,
        appOrigin: window.location.origin,
        appName: 'SecretMint NFT',
      });

      const cap = await sdk.requestCapability({
        circle: APP_CIRCLE,
        methods: ['get_balance', 'send_transaction'],
        scope: 'write',
        encrypted: false,
        ttlSeconds: 7200,
      });
      capRef.current = cap;

      setWallet({
        address: connection.walletPubKey || connection.address,
        publicKey: connection.walletPubKey,
        evmAddress: connection.evmAddress,
        network: connection.network,
        viewPublicKey: connection.viewPublicKey,
        sdk,
        capId: cap.id,
      });

      toast.success(`Wallet connected (${connection.network})`);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (error.name === 'UserRejectedError') {
        toast.error('Connection rejected by user');
      } else {
        toast.error(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [getSDK]);

  const disconnect = useCallback(async () => {
    try {
      const sdk = await getSDK();
      await sdk.disconnect();
    } catch (e) {
      // ignore
    }
    setWallet(null);
    setBalance(null);
    capRef.current = null;
    toast.success('Wallet disconnected');
  }, [getSDK]);

  const signMessage = useCallback(async (message) => {
    if (!wallet) throw new Error('Wallet not connected');
    const sdk = await getSDK();
    const result = await sdk.signMessage(message);
    return result.signature;
  }, [wallet, getSDK]);

  const sendTransaction = useCallback(async (transaction) => {
    if (!wallet || !wallet.capId) throw new Error('Wallet not connected');
    const sdk = await getSDK();
    return await sdk.sendContractCall(wallet.capId, {
      contract: transaction.to || CONTRACT_ADDRESS,
      method: transaction.method,
      params: transaction.params || [],
      amount: transaction.value || 0,
    });
  }, [wallet, getSDK]);

  useEffect(() => {
    if (!wallet || !wallet.capId) return;

    const fetchBalance = async () => {
      try {
        const sdk = await getSDK();
        const balanceData = await sdk.getBalance(wallet.capId);
        setBalance(balanceData.octBalance.toFixed(6));
      } catch (e) {
        try {
          const response = await fetch(`${OCTRA_RPC}/balance/${wallet.address}`).catch(() => null);
          if (response && response.ok) {
            const data = await response.json();
            if (data && data.balance_raw) {
              setBalance((parseInt(data.balance_raw, 10) / 1_000_000).toFixed(6));
            } else {
              setBalance('0');
            }
          } else {
            setBalance('0');
          }
        } catch {
          setBalance('0');
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet, getSDK]);

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
