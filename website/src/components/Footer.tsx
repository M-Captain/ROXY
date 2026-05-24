import React from 'react';
import { Twitter, Github, MessageCircle, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'Platform': [
      'Explore Properties',
      'How it Works',
      'Dashboard',
      'Marketplace',
    ],
    
    'Legal': [
      'Terms of Service',
      'Privacy Policy',
      'Cookie Policy',
      'Compliance',
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-dark-bg border-t border-dark-border relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-card/20 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-neon rounded-lg flex items-center justify-center animate-glow">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <span className="font-space font-bold text-2xl electric-text">PropertyChain</span>
              </div>
              <p className="text-dark-muted text-lg mb-8 leading-relaxed">
                Reimagining real estate through blockchain technology. 
                Invest in tokenized properties with transparency, liquidity, and global access.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-12 h-12 glass-card rounded-lg flex items-center justify-center text-dark-muted hover:text-white hover:neon-glow transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 group-hover:animate-pulse-neon" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Grid */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Object.entries(footerLinks).map(([category, links]) => (
                  <div key={category}>
                    <h3 className="text-white font-semibold text-lg mb-6 font-space">{category}</h3>
                    <ul className="space-y-4">
                      {links.map((link) => (
                        <li key={link}>
                          <a
                            href="#"
                            className="text-dark-muted hover:text-white hover:electric-text transition-all duration-300"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-dark-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 text-dark-muted text-sm">
              <p>&copy; 2024 PropertyChain. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span>Built on</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <span className="text-white">Ethereum</span>
                </div>
              </div>
            </div>
            
            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-dark-muted hover:text-white hover:electric-text transition-all duration-300 group"
            >
              <span className="text-sm">Back to top</span>
              <ArrowUp className="w-4 h-4 group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
