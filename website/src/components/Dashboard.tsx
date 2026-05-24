
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  Building, 
  Activity, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const portfolioStats = {
    totalValue: "156.7 ETH",
    totalUSD: "$312,450",
    monthlyIncome: "4.2 ETH",
    totalProperties: 8,
    avgAPY: "11.3%",
  };

  const ownedProperties = [
    {
      id: 1,
      name: "Manhattan Penthouse",
      location: "New York, NY",
      ownership: "12.5%",
      value: "45.2 ETH",
      monthlyIncome: "1.8 ETH",
      apy: "12.5%",
      status: "Active",
    },
    {
      id: 2,
      name: "Beverly Hills Villa",
      location: "Los Angeles, CA",
      ownership: "8.3%",
      value: "32.1 ETH",
      monthlyIncome: "1.1 ETH",
      apy: "9.8%",
      status: "Active",
    },
    {
      id: 3,
      name: "Oceanfront Condo",
      location: "Miami, FL",
      ownership: "25.0%",
      value: "67.8 ETH",
      monthlyIncome: "2.3 ETH",
      apy: "15.2%",
      status: "Active",
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "buy",
      property: "Manhattan Penthouse",
      amount: "2.5 ETH",
      date: "2024-01-15",
      status: "Completed",
    },
    {
      id: 2,
      type: "income",
      property: "Beverly Hills Villa",
      amount: "1.1 ETH",
      date: "2024-01-14",
      status: "Completed",
    },
    {
      id: 3,
      type: "sell",
      property: "Downtown Loft",
      amount: "1.8 ETH",
      date: "2024-01-12",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg pt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-space font-bold text-dark-text mb-2">
            Investment <span className="electric-text">Dashboard</span>
          </h1>
          <p className="text-dark-muted font-inter">
            Track your tokenized real estate portfolio and earnings
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-gradient-neon text-white border-0 neon-glow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="font-space">Total Portfolio Value</span>
                <Wallet className="w-5 h-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-space font-bold">{portfolioStats.totalValue}</p>
                <p className="text-white/80 font-inter">{portfolioStats.totalUSD}</p>
                <div className="flex items-center text-sm text-white/80">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>+8.4% this month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-inter text-dark-muted">Monthly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-space font-bold electric-text">{portfolioStats.monthlyIncome}</p>
              <div className="flex items-center text-sm text-neon-green mt-1">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+12.3%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-inter text-dark-muted">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-space font-bold text-dark-text">{portfolioStats.totalProperties}</p>
              <div className="flex items-center text-sm text-dark-muted mt-1">
                <Building className="w-4 h-4 mr-1" />
                <span>Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card neon-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-inter text-dark-muted">Avg. APY</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-space font-bold electric-text">{portfolioStats.avgAPY}</p>
              <div className="flex items-center text-sm text-neon-green mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Above market</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="glass-card neon-border bg-dark-card">
            <TabsTrigger value="properties" className="font-inter data-[state=active]:bg-gradient-neon data-[state=active]:text-white">My Properties</TabsTrigger>
            <TabsTrigger value="transactions" className="font-inter data-[state=active]:bg-gradient-neon data-[state=active]:text-white">Transactions</TabsTrigger>  
            <TabsTrigger value="analytics" className="font-inter data-[state=active]:bg-gradient-neon data-[state=active]:text-white">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid gap-6">
              {ownedProperties.map((property) => (
                <Card key={property.id} className="glass-card neon-border hover:neon-glow transition-all duration-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-neon rounded-lg flex items-center justify-center animate-glow">
                          <Building className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-space font-bold text-dark-text">{property.name}</h3>
                          <p className="text-dark-muted font-inter">{property.location}</p>
                          <Badge variant="outline" className="mt-1 neon-border electric-text">
                            {property.ownership} ownership
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                        <div>
                          <p className="text-sm text-dark-muted font-inter">Value</p>
                          <p className="font-space font-bold electric-text">{property.value}</p>
                        </div>
                        <div>
                          <p className="text-sm text-dark-muted font-inter">Monthly Income</p>
                          <p className="font-space font-bold text-neon-green">{property.monthlyIncome}</p>
                        </div>
                        <div>
                          <p className="text-sm text-dark-muted font-inter">APY</p>
                          <p className="font-space font-bold electric-text">{property.apy}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="default" className="flex items-center glass-card neon-border text-dark-text">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="bg-gradient-neon text-white neon-glow">
                            Manage
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="glass-card neon-border">
              <CardHeader>
                <CardTitle className="font-space text-dark-text">Recent Transactions</CardTitle>
                <CardDescription className="font-inter text-dark-muted">
                  Your latest property investments and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 glass-card rounded-lg neon-border">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'buy' ? 'bg-electric-blue/20 text-electric-blue' :
                          transaction.type === 'sell' ? 'bg-neon-pink/20 text-neon-pink' :
                          'bg-neon-green/20 text-neon-green'
                        }`}>
                          {transaction.type === 'buy' ? <ArrowUpRight className="w-5 h-5" /> :
                           transaction.type === 'sell' ? <ArrowDownRight className="w-5 h-5" /> :
                           <DollarSign className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-space font-semibold text-dark-text">
                            {transaction.type === 'buy' ? 'Purchased' :
                             transaction.type === 'sell' ? 'Sold' : 'Income from'} {transaction.property}
                          </p>
                          <p className="text-sm text-dark-muted font-inter flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-space font-bold electric-text">{transaction.amount}</p>
                        <Badge variant="outline" className="mt-1 neon-border text-neon-green">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-hero rounded-lg flex items-center justify-center border border-dark-border">
                    <p className="text-dark-muted font-inter">Performance Chart Visualization</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Income Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-hero rounded-lg flex items-center justify-center border border-dark-border">
                    <p className="text-dark-muted font-inter">Income Chart Visualization</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
