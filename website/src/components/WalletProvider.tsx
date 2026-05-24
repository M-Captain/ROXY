import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// Add this to allow TypeScript to recognize window.ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletContextType {
  provider: BrowserProvider | null;
  account: string | null;
  connecting: boolean;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const WalletContextProvider: React.FC<Props> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      let ethereum = window.ethereum;
      if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
        ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
      }
      if (ethereum && ethereum.isMetaMask) {
        const browserProvider = new BrowserProvider(ethereum);
        setProvider(browserProvider);
        try {
          // Check if already connected
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    let ethereum = window.ethereum;
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
    }
    if (ethereum && ethereum.isMetaMask) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };
      const handleChainChanged = () => {
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      };
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', handleChainChanged);
      return () => {
        if (ethereum?.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const connect = useCallback(async () => {
    let ethereum = window.ethereum;
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
    }
    if (!ethereum || !ethereum.isMetaMask) {
      alert('Please install MetaMask or another Ethereum wallet');
      return;
    }
    setConnecting(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
  }, []);

  const value: WalletContextType = useMemo(() => ({
    provider,
    account,
    connecting,
    connected: !!account,
    connect,
    disconnect,
  }), [provider, account, connecting, connect, disconnect]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletContextProvider');
  }
  return context;
};

export default WalletContextProvider;
