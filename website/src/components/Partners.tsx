import React from 'react';

const Partners = () => {
  const partners = [
    { name: 'Ethereum', logo: './logo/Ethereum.png' },
    { name: 'Polygon', logo: './logo/polygon.jpg' },
    { name: 'Chainlink', logo: './logo/Chainlink.png' },
    { name: 'IPFS', logo: './logo/IPFS.png' },
  ];

  // Duplicate the partners array for seamless looping
  const marqueePartners = [...partners, ...partners, ...partners,...partners];

  return (
    <section className="py-20 bg-dark-bg relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-space font-bold mb-6">
            <span className="electric-text">Powered by</span>{' '}
            <span className="text-white">Web3 Leaders</span>
          </h2>
          <p className="text-dark-muted text-lg max-w-2xl mx-auto">
            Built on the most trusted and innovative blockchain technologies
          </p>
        </div>
        {/* Marquee */}
        <div className="relative w-full overflow-x-hidden">
          <div
            className="flex items-center gap-12 animate-marquee"
            style={{
              width: 'max-content',
              animation: 'marquee 18s linear infinite',
            }}
          >
            {marqueePartners.map((partner, index) => (
              <div
                key={index + partner.name}
                className="glass-card p-6 rounded-xl hover:neon-glow transition-all duration-500 group cursor-pointer flex flex-col items-center min-w-[180px]"
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-neon">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 text-center">{partner.name}</h3>
              </div>
            ))}
          </div>
        </div>
        {/* Marquee animation keyframes */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-30.66%); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default Partners;
