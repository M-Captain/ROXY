
import React from 'react';
import { Wallet, Search, Users, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Link your Web3 wallet to access tokenized real estate investments securely",
      color: "neon-purple",
    },
    {
      icon: Search,
      title: "Explore Properties",
      description: "Browse verified properties with detailed analytics and investment opportunities",
      color: "neon-cyan",
    },
    {
      icon: Users,
      title: "Invest & Own",
      description: "Purchase fractional ownership tokens and become a verified property investor",
      color: "electric-blue",
    },
    {
      icon: TrendingUp,
      title: "Earn Returns",
      description: "Receive rental income and capital appreciation directly to your wallet",
      color: "neon-green",
    },
  ];

  return (
    <div className="bg-dark-bg py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-space font-bold text-dark-text mb-4">
            How <span className="electric-text animate-glow">PropertyChain</span> Works
          </h2>
          <p className="text-xl text-dark-muted font-inter max-w-3xl mx-auto">
            Experience seamless property investment powered by blockchain technology
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-neon transform -translate-y-1/2 z-0 animate-glow"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center group animate-slide-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Icon Circle */}
                <div className="relative mb-6">
                  <div className={`w-20 h-20 mx-auto bg-gradient-neon rounded-full flex items-center justify-center neon-glow group-hover:animate-pulse-neon transition-all duration-300`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 glass-card neon-border rounded-full flex items-center justify-center">
                    <span className="text-sm font-space font-bold electric-text">{index + 1}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-space font-bold text-dark-text group-hover:electric-text transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-dark-muted font-inter leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Contract Visualization */}
        <div className="mt-20">
          <div className="glass-card neon-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-space font-bold text-dark-text mb-2">
                Powered by <span className="electric-text">Smart Contracts</span>
              </h3>
              <p className="text-dark-muted font-inter">
                Transparent, secure, and automated property transactions
              </p>
            </div>

            {/* Contract Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6 neon-border hover:neon-glow transition-all duration-500 group">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-neon rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:animate-pulse-neon">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <h4 className="font-space font-bold text-dark-text mb-2 group-hover:electric-text transition-colors">Property Token</h4>
                  <p className="text-sm text-dark-muted font-inter">ERC-721 NFT representing property ownership</p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 neon-border hover:neon-glow transition-all duration-500 group">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-electric rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:animate-pulse-neon">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <h4 className="font-space font-bold text-dark-text mb-2 group-hover:electric-text transition-colors">Investment Pool</h4>
                  <p className="text-sm text-dark-muted font-inter">Collective ownership through tokenization</p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 neon-border hover:neon-glow transition-all duration-500 group">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-neon rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:animate-pulse-neon">
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <h4 className="font-space font-bold text-dark-text mb-2 group-hover:electric-text transition-colors">Yield Distribution</h4>
                  <p className="text-sm text-dark-muted font-inter">Automated rental income payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
