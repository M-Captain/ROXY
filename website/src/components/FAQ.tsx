import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is tokenized real estate?',
      answer: 'Tokenized real estate involves converting property ownership rights into digital tokens on a blockchain. This allows for fractional ownership, easier trading, and increased liquidity in real estate investments.',
    },
    {
      question: 'How do I buy fractional ownership in a property?',
      answer: 'Simply connect your Web3 wallet, browse available properties, and purchase the number of tokens you want. Each token represents a fraction of the property ownership and its potential returns.',
    },
    {
      question: 'What are the benefits of blockchain real estate?',
      answer: 'Blockchain real estate offers transparency, reduced transaction costs, faster settlements, global accessibility, fractional ownership opportunities, and immutable ownership records.',
    },
    {
      question: 'Which cryptocurrencies do you accept?',
      answer: 'We accept major cryptocurrencies including ETH, USDC, USDT, and other ERC-20 tokens. We also support payments through multiple blockchain networks including Ethereum and Polygon.',
    },
    {
      question: 'How are property values determined?',
      answer: 'Property values are determined through professional appraisals, market analysis, and real-time data feeds from trusted oracles. Values are updated regularly to reflect current market conditions.',
    },
    {
      question: 'What happens to rental income?',
      answer: 'Rental income is automatically distributed to token holders proportionally to their ownership stake. Distributions are made monthly directly to your connected wallet in stablecoins.',
    },
    {
      question: 'Is my investment secure?',
      answer: 'Yes, all smart contracts are audited by leading security firms, and property ownership is legally structured through established real estate entities. Your tokens are secured on the blockchain.',
    },
    {
      question: 'Can I sell my tokens anytime?',
      answer: 'Yes, tokens can be traded on our marketplace or external DEXs 24/7. This provides unprecedented liquidity compared to traditional real estate investments.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-dark-bg to-dark-card/30 relative overflow-hidden">
      {/* Background Effects */}
    
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-space font-bold mb-6">
            <span className="text-white">Frequently Asked</span>{' '}
            <span className="electric-text">Questions</span>
          </h2>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Everything you need to know about Web3 real estate investing
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-card rounded-xl overflow-hidden border border-dark-border hover:border-neon-purple/30 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-dark-card/30 transition-all duration-300"
              >
                <h3 className="text-white font-semibold text-lg pr-4">{faq.question}</h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-neon-cyan" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-dark-muted" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <div className="h-px bg-gradient-to-r from-neon-purple/20 via-neon-cyan/20 to-transparent mb-4"></div>
                  <p className="text-dark-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
