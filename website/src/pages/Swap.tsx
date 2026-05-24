import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useSwap } from '@/hooks/use-swap';
import { ArrowRight } from 'lucide-react';

const Swap = () => {
  const [direction, setDirection] = useState<'KMC_TO_ETH' | 'ETH_TO_KMC'>('KMC_TO_ETH');
  const [amount, setAmount] = useState('');
  const {
    outputAmount,
    slippage,
    needsApproval,
    loading,
    error,
    txHash,
    approve,
    swap,
    connectWallet,
    walletConnected,
    estimating,
  } = useSwap({ direction, amount });

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center font-inter py-16 px-4">
      <div className="glass-card neon-border rounded-2xl p-8 w-full max-w-md space-y-8 shadow-xl animate-slide-up">
        <h2 className="text-3xl font-space font-bold mb-6 electric-text text-center">Swap KMC &harr; ETH</h2>
        <div className="space-y-6">
          <div>
            <Label htmlFor="direction" className="text-dark-muted font-inter mb-2 block">Swap Direction</Label>
            <Select value={direction} onValueChange={v => setDirection(v as any)}>
              <SelectTrigger id="direction" className="bg-dark-card border-dark-border focus:border-neon-cyan text-dark-text placeholder:text-dark-muted rounded-xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border text-dark-text">
                <SelectItem value="KMC_TO_ETH">KMC → ETH</SelectItem>
                <SelectItem value="ETH_TO_KMC">ETH → KMC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount" className="text-dark-muted font-inter mb-2 block">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              placeholder={direction === 'KMC_TO_ETH' ? 'KMC amount' : 'ETH amount'}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={loading || estimating}
              className="bg-dark-card border-dark-border focus:border-neon-cyan text-dark-text placeholder:text-dark-muted rounded-xl h-12"
            />
          </div>
          <div className="text-sm text-electric-text font-space text-center">
            Output: <span className="font-bold">{outputAmount || '--'}</span> {direction === 'KMC_TO_ETH' ? 'ETH' : 'KMC'}
          </div>
          {slippage > 1 && (
            <div className="text-sm font-semibold italic text-neon-pink text-center animate-glow">Slippage warning: {slippage.toFixed(2)}%</div>
          )}
          {error && <div className="text-sm text-red-500 font-semibold text-center">{error}</div>}
          {txHash && (
            <div className="text-sm text-neon-green font-semibold text-center">
              Success! Tx: <a href={`https://etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash.slice(0, 10)}...</a>
            </div>
          )}
          <div className="pt-2">
            {!walletConnected ? (
              <Button className="w-full bg-gradient-neon text-white font-inter font-semibold py-3 hover:animate-pulse-neon transition-all duration-300 group neon-glow rounded-xl text-lg flex items-center justify-center" onClick={connectWallet} disabled={loading}>
                Connect Wallet
                <span className="ml-2 group-hover:translate-x-1 transition-transform"><ArrowRight className="w-5 h-5" /></span>
              </Button>
            ) : needsApproval ? (
              <Button className="w-full bg-gradient-neon text-white font-inter font-semibold py-3 hover:animate-pulse-neon transition-all duration-300 group neon-glow rounded-xl text-lg flex items-center justify-center" onClick={approve} disabled={loading || estimating}>
                Approve KMC
                <span className="ml-2 group-hover:translate-x-1 transition-transform"><ArrowRight className="w-5 h-5" /></span>
              </Button>
            ) : (
              <Button className="w-full bg-gradient-neon text-white font-inter font-semibold py-3 hover:animate-pulse-neon transition-all duration-300 group neon-glow rounded-xl text-lg flex items-center justify-center" onClick={swap} disabled={loading || estimating || !amount || Number(amount) <= 0}>
                {loading ? 'Swapping...' : 'Swap'}
                <span className="ml-2 group-hover:translate-x-1 transition-transform"><ArrowRight className="w-5 h-5" /></span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap; 