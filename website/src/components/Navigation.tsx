import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search, BarChart3, BookOpen, HelpCircle, Moon, Sun, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { WalletConnectButton } from './WalletConnectButton';

const Navigation = () => {
  const [isDark, setIsDark] = useState(true);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Properties', path: '/properties' },
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'How It Works', path: '/how-it-works' },
    { icon: Plus, label: 'Create', path: '/create-listing' },
    // { icon: BarChart3, label: 'Valuation Test', path: '/valuation-test' },
  ];

  return (
    <nav className="fixed top-0 w-full bg-dark-bg/95 backdrop-blur-md border-b border-dark-border z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-neon rounded-lg flex items-center justify-center animate-glow">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-space font-bold text-xl electric-text">PropertyChain</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-gradient-neon text-white neon-glow'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-card/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-inter font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-card/50 transition-all duration-300"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Solana Wallet Connect Button */}
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;