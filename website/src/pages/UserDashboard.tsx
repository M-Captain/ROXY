import React from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navigation />
      <Dashboard />
    </div>
  );
};

export default UserDashboard;