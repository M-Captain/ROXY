
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Users, TrendingUp, Zap } from 'lucide-react';

const PropertyGrid = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const properties = [
    {
      id: 1,
      title: "Manhattan Penthouse",
      location: "New York, NY",
      image: "gradient-neon",
      totalValue: "5,000 ETH",
      minInvestment: "0.5 ETH",
      sold: 85,
      investors: 234,
      apy: "12.5%",
      status: "Live",
      verified: true,
    },
    {
      id: 2,
      title: "Beverly Hills Villa",
      location: "Los Angeles, CA",
      image: "gradient-electric",
      totalValue: "3,200 ETH",
      minInvestment: "0.2 ETH",
      sold: 67,
      investors: 156,
      apy: "9.8%",
      status: "Live",
      verified: true,
    },
    {
      id: 3,
      title: "Oceanfront Condo",
      location: "Miami, FL",
      image: "gradient-neon",
      totalValue: "1,800 ETH",
      minInvestment: "0.1 ETH",
      sold: 92,
      investors: 98,
      apy: "15.2%",
      status: "Almost Sold",
      verified: true,
    },
    {
      id: 4,
      title: "Downtown Loft",
      location: "Chicago, IL",
      image: "gradient-electric",
      totalValue: "2,100 ETH",
      minInvestment: "0.15 ETH",
      sold: 43,
      investors: 87,
      apy: "11.3%",
      status: "Live",
      verified: true,
    },
    {
      id: 5,
      title: "Silicon Valley Office",
      location: "San Francisco, CA",
      image: "gradient-neon",
      totalValue: "8,500 ETH",
      minInvestment: "1.0 ETH",
      sold: 28,
      investors: 45,
      apy: "8.7%",
      status: "New",
      verified: true,
    },
    {
      id: 6,
      title: "Austin Tech Hub",
      location: "Austin, TX",
      image: "gradient-electric",
      totalValue: "4,300 ETH",
      minInvestment: "0.3 ETH",
      sold: 76,
      investors: 189,
      apy: "13.9%",
      status: "Live",
      verified: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live": return "bg-neon-green";
      case "New": return "bg-electric-cyan";
      case "Almost Sold": return "bg-neon-pink";
      default: return "bg-dark-muted";
    }
  };

  return (
    <div className="bg-dark-bg py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-space font-bold text-dark-text mb-4">
            Explore <span className="electric-text">Tokenized Properties</span>
          </h2>
          <p className="text-xl text-dark-muted font-inter max-w-3xl mx-auto">
            Discover premium real estate opportunities with blockchain-powered fractional ownership
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card neon-border rounded-2xl p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-muted w-5 h-5" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-dark-card border-dark-border focus:border-neon-cyan text-dark-text placeholder:text-dark-muted"
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12 bg-dark-card border-dark-border focus:border-neon-cyan text-dark-text">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border">
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="ny">New York</SelectItem>
                <SelectItem value="ca">California</SelectItem>
                <SelectItem value="fl">Florida</SelectItem>
                <SelectItem value="tx">Texas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-12 bg-dark-card border-dark-border focus:border-neon-cyan text-dark-text">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="almost-sold">Almost Sold</SelectItem>
              </SelectContent>
            </Select>

            <Button className="h-12 bg-gradient-neon text-white font-inter font-semibold hover:animate-pulse-neon transition-all duration-300 neon-glow">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <div 
              key={property.id} 
              className="group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="glass-card neon-border rounded-2xl hover:neon-glow transition-all duration-500 overflow-hidden hover:scale-105">
                {/* Property Image */}
                <div className={`h-48 bg-${property.image} relative flex items-center justify-center`}>
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-8 h-8 bg-white rounded"></div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 ${getStatusColor(property.status)} text-white px-3 py-1 rounded-full text-sm font-inter font-semibold backdrop-blur-sm`}>
                    {property.status}
                  </div>
                  
                  {/* Verified Badge */}
                  {property.verified && (
                    <div className="absolute top-4 right-4 bg-neon-green text-white p-2 rounded-full backdrop-blur-sm">
                      <Zap className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-space font-bold text-dark-text group-hover:electric-text transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-dark-muted">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="font-inter">{property.location}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-inter">
                      <span className="text-dark-muted">Sold</span>
                      <span className="font-semibold text-dark-text">{property.sold}%</span>
                    </div>
                    <div className="w-full bg-dark-border rounded-full h-2">
                      <div 
                        className="bg-gradient-neon h-2 rounded-full transition-all duration-500 animate-glow"
                        style={{ width: `${property.sold}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-dark-border">
                    <div>
                      <p className="text-dark-muted font-inter text-sm">Total Value</p>
                      <p className="text-dark-text font-space font-bold electric-text">{property.totalValue}</p>
                    </div>
                    <div>
                      <p className="text-dark-muted font-inter text-sm">Min. Investment</p>
                      <p className="text-dark-text font-space font-bold electric-text">{property.minInvestment}</p>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-dark-muted">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="font-inter">{property.investors} investors</span>
                    </div>
                    <div className="flex items-center text-neon-green">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-inter font-semibold">{property.apy} APY</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full bg-gradient-neon text-white font-inter font-semibold py-3 hover:animate-pulse-neon transition-all duration-300 group neon-glow rounded-xl">
                    View Details
                    <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyGrid;
