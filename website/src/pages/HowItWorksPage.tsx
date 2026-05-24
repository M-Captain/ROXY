import React from 'react';
import Navigation from '@/components/Navigation';
import HowItWorks from '@/components/HowItWorks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Search, 
  Users, 
  TrendingUp, 
  Shield, 
  Code, 
  FileText, 
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HowItWorksPage = () => {
  const smartContractFeatures = [
    {
      icon: Shield,
      title: "Secure Ownership",
      description: "Immutable blockchain records ensure transparent and secure property ownership verification"
    },
    {
      icon: Users,
      title: "Fractional Investment",
      description: "Smart contracts enable multiple investors to own fractions of high-value properties"
    },
    {
      icon: TrendingUp,
      title: "Automated Yields",
      description: "Rental income is automatically distributed to token holders based on their ownership percentage"
    },
    {
      icon: Code,
      title: "Programmable Logic",
      description: "Smart contracts execute predefined rules for property management and revenue distribution"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Property Verification",
      description: "Legal ownership verification, property appraisal, and compliance checks",
      details: ["Legal deed verification", "Professional property appraisal", "Regulatory compliance review", "Insurance verification"]
    },
    {
      step: 2,
      title: "Smart Contract Deployment",
      description: "Creating blockchain-based property tokens with defined ownership rules",
      details: ["ERC-721 NFT creation", "Token economics definition", "Revenue distribution rules", "Ownership transfer protocols"]
    },
    {
      step: 3,
      title: "Marketplace Listing",
      description: "Property tokens become available for fractional investment",
      details: ["Public listing creation", "Investment terms publication", "Marketing and promotion", "Investor onboarding"]
    },
    {
      step: 4,
      title: "Revenue Distribution",
      description: "Automated rental income distribution to all token holders",
      details: ["Monthly rent collection", "Automated token holder payments", "Yield calculation", "Transaction transparency"]
    }
  ];

  const benefits = [
    "Lower barrier to entry for real estate investment",
    "Diversification across multiple properties",
    "Passive income through rental yields",
    "Liquidity through secondary market trading",
    "Transparent ownership records on blockchain",
    "Reduced transaction costs and intermediaries"
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-slide-up">
            <h1 className="text-4xl lg:text-6xl font-space font-bold text-dark-text mb-6">
              How <span className="electric-text">Smart Contracts</span>
              <br />
              Transform Real Estate
            </h1>
            <p className="text-xl text-dark-muted font-inter max-w-4xl mx-auto">
              Discover how blockchain technology enables fractional property ownership, 
              automated yield distribution, and transparent real estate investment.
            </p>
          </div>

          {/* Smart Contract Visualization */}
          <div className="mb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="glass-card neon-border overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-space font-bold text-dark-text mb-4">
                    Smart Contract <span className="electric-text">Architecture</span>
                  </h2>
                  <p className="text-dark-muted font-inter">
                    Blockchain-powered property tokenization with automated management
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {smartContractFeatures.map((feature, index) => (
                    <div 
                      key={index}
                      className="text-center group animate-slide-up"
                      style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    >
                      <div className="w-20 h-20 mx-auto bg-gradient-neon rounded-full flex items-center justify-center neon-glow group-hover:animate-pulse-neon transition-all duration-300 mb-4">
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-lg font-space font-bold text-dark-text mb-2 group-hover:electric-text transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-dark-muted font-inter text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Process Flow */}
          <div className="mb-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-space font-bold text-dark-text mb-4">
                Tokenization <span className="electric-text">Process</span>
              </h2>
              <p className="text-dark-muted font-inter">
                From property verification to automated yield distribution
              </p>
            </div>

            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <div key={index} className="relative">
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-32 bg-gradient-neon animate-glow"></div>
                  )}
                  
                  <Card className="glass-card neon-border hover:neon-glow transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center neon-glow">
                            <span className="text-2xl font-space font-bold text-white">{step.step}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <h3 className="text-2xl font-space font-bold text-dark-text">{step.title}</h3>
                            <ArrowRight className="w-6 h-6 text-neon-cyan" />
                          </div>
                          <p className="text-dark-muted font-inter mb-6">{step.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {step.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="flex items-center space-x-3">
                                <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
                                <span className="text-dark-text font-inter text-sm">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-20 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-space font-bold text-dark-text mb-4">
                Why Choose <span className="electric-text">Tokenized Real Estate</span>
              </h2>
              <p className="text-dark-muted font-inter">
                Revolutionary benefits of blockchain-powered property investment
              </p>
            </div>

            <Card className="glass-card neon-border">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-neon-green rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-dark-text font-inter">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technology Stack */}
          <div className="mb-20 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-space font-bold text-dark-text mb-4">
                Built on <span className="electric-text">Cutting-Edge Technology</span>
              </h2>
              <p className="text-dark-muted font-inter">
                Powered by industry-leading blockchain infrastructure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card neon-border hover:neon-glow transition-all duration-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-neon rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-space font-bold text-dark-text mb-2">Solana Blockchain</h3>
                  <p className="text-dark-muted font-inter text-sm">
                    High-speed, low-cost transactions with enterprise-grade security
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card neon-border hover:neon-glow transition-all duration-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-electric rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-space font-bold text-dark-text mb-2">Smart Contracts</h3>
                  <p className="text-dark-muted font-inter text-sm">
                    Automated, transparent, and immutable property management logic
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card neon-border hover:neon-glow transition-all duration-500">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-neon rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-space font-bold text-dark-text mb-2">Legal Framework</h3>
                  <p className="text-dark-muted font-inter text-sm">
                    Compliant with real estate regulations and securities laws
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Original How It Works Component */}
          <div className="animate-slide-up" style={{ animationDelay: '1s' }}>
            <HowItWorks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
