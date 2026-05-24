"use client";
import { useWallet } from './WalletProvider';

export const WalletConnectButton = () => {
  const { account, connecting, connected, connect, disconnect } = useWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white text-black hover:text-white hover:bg-primary/90 font-semibold rounded-xl px-5 py-2 transition-all duration-200"
      disabled={connecting}
    >
      {connecting
        ? "Connecting..."
        : connected && account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
};
