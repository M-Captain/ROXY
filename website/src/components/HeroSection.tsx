

import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Zap } from 'lucide-react';
import { WalletConnectButton } from './WalletConnectButton';

const HeroSection = () => {
  const features = [
    { icon: Shield, label: 'Blockchain Security', color: 'neon-purple' },
    { icon: TrendingUp, label: 'Fractional Ownership', color: 'neon-cyan' },
    { icon: Zap, label: 'Instant Transactions', color: 'electric-blue' },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-hero pt-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-neon-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/10 rounded-full blur-3xl animate-pulse-neon"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center space-y-8 animate-slide-up">
          {/* Badge */}
        
          
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-8xl font-space font-bold leading-tight">
              <span className="text-dark-text">Reimagining</span>
              <br />
              <span className="electric-text animate-glow">Real Estate</span>
              <br />
              <span className="text-dark-text">on</span>{' '}
              <span className="electric-text">Web3</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-dark-muted font-inter leading-relaxed max-w-4xl mx-auto">
              Experience the future of property investment with tokenized real estate, 
              fractional ownership, and blockchain-powered transparency.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
          <WalletConnectButton />
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-8 pt-16">
            {features.map((feature, index) => (
              <div 
                key={feature.label} 
                className="flex items-center space-x-3 glass-card px-6 py-4 rounded-xl neon-border animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center animate-glow`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-inter font-medium text-dark-text">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Property Card */}
        <div className="mt-20 flex justify-center">
          <div className="glass-card neon-border rounded-2xl p-8 max-w-md transform hover:scale-105 transition-all duration-500 animate-float">
            <div className="space-y-6">
              <div className="w-full h-48 bg-gradient-electric rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20"></div>
                <div className="relative text-center text-white z-10">
                  <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-8 h-8 bg-white rounded"></div>
                  </div>
                  <p className="font-inter font-semibold">Luxury Villa NFT</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-space font-bold text-dark-text">Miami Beach Villa</h3>
                  <div className="bg-gradient-neon text-white px-3 py-1 rounded-full text-sm font-inter font-semibold">
                    75% Sold
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-dark-muted font-inter text-sm">Total Value</p>
                    <p className="text-dark-text font-space font-bold text-lg electric-text">2,500 ETH</p>
                  </div>
                  <div>
                    <p className="text-dark-muted font-inter text-sm">Min. Investment</p>
                    <p className="text-dark-text font-space font-bold text-lg electric-text">0.1 ETH</p>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-neon text-white font-inter font-semibold py-4 hover:animate-pulse-neon transition-all duration-300 neon-glow rounded-xl">
                  Invest Now
                </Button>
              </div>
            </div>

            {/* Floating Status Badges */}
            <div className="absolute -top-4 -right-4 bg-neon-green text-dark-bg px-4 py-2 rounded-lg neon-glow animate-bounce">
              <p className="font-inter font-semibold text-sm">Live Trading</p>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-electric-purple text-white px-4 py-2 rounded-lg neon-glow animate-pulse-neon">
              <p className="font-inter font-semibold text-sm">Verified on Chain</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
