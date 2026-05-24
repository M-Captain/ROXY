import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, MapPin, Users, TrendingUp, Zap, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { useProperties, Property } from '@/hooks/use-properties';
import { useNavigate } from 'react-router-dom';

const PropertyListings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [priceRange, setPriceRange] = useState("");
  
  const navigate = useNavigate();
  const { properties, loading, error, refreshProperties, isConnected } = useProperties();

  // Helper to convert IPFS URI to HTTP URL
  const resolveIPFS = (uri: string) => {
    if (uri.startsWith('ipfs://')) {
      const hash = uri.substring(7);
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return uri;
  };

  // Filter properties based on search criteria
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.metadata?.title && property.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = !selectedLocation || property.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === "active" && property.isActive) ||
                         (selectedStatus === "inactive" && !property.isActive);
    
    const matchesPrice = !priceRange || (() => {
      const price = parseFloat(property.price);
      switch (priceRange) {
        case "0-100": return price <= 100;
        case "100-500": return price > 100 && price <= 500;
        case "500-1000": return price > 500 && price <= 1000;
        case "1000+": return price > 1000;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesLocation && matchesStatus && matchesPrice;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const calculateProgress = (availableShares: number, totalShares: number) => {
    return ((totalShares - availableShares) / totalShares) * 100;
  };

  const getStatusColor = (isActive: boolean, availableShares: number, totalShares: number) => {
    if (!isActive) return "bg-red-500";
    const progress = calculateProgress(availableShares, totalShares);
    if (progress >= 90) return "bg-orange-500";
    return "bg-green-500";
  };

  const getStatusText = (isActive: boolean, availableShares: number, totalShares: number) => {
    if (!isActive) return "Inactive";
    const progress = calculateProgress(availableShares, totalShares);
    if (progress >= 90) return "Almost Sold";
    return "Live";
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <div className="p-8 glass-card neon-border rounded-lg">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-electric-cyan" />
              <h2 className="text-2xl font-space font-bold text-dark-text mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-dark-muted font-inter">
                Please connect your wallet to view property listings from the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl lg:text-5xl font-space font-bold text-dark-text mb-4">
              Property <span className="electric-text">Listings</span>
            </h1>
            <p className="text-xl text-dark-muted font-inter max-w-3xl mx-auto">
              Discover premium tokenized real estate opportunities
            </p>
          </div>

          {/* Advanced Filters */}
          <Card className="glass-card neon-border mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-12 bg-dark-card border-dark-border focus:border-neon-cyan text-dark-text">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-dark-border">
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="0-1">0-1 ETH</SelectItem>
                    <SelectItem value="1-5">1-5 ETH</SelectItem>
                    <SelectItem value="5+">5+ ETH</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="h-12 bg-gradient-neon text-white font-inter font-semibold hover:animate-pulse-neon transition-all duration-300 neon-glow">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-dark-muted font-inter">
              Showing <span className="electric-text font-semibold">6 properties</span> available for investment
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-dark-muted font-inter text-sm">Sort by:</span>
              <Select defaultValue="featured">
                <SelectTrigger className="w-32 bg-dark-card border-dark-border text-dark-text">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-border">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="apy">Highest APY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-electric-cyan animate-spin" />
              <p className="text-dark-muted font-inter">Loading properties from blockchain...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-400 font-inter mb-4">{error}</p>
              <Button 
                onClick={refreshProperties}
                className="bg-gradient-neon text-white font-inter"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="p-8 glass-card neon-border rounded-lg">
                <h3 className="text-xl font-space font-bold text-dark-text mb-4">
                  No Properties Found
                </h3>
                <p className="text-dark-muted font-inter mb-6">
                  {properties.length === 0 
                    ? "No properties have been listed on the blockchain yet." 
                    : "No properties match your current filters."}
                </p>
                <Button 
                  onClick={() => navigate('/create-listing')}
                  className="bg-gradient-neon text-white font-inter"
                >
                  List First Property
                </Button>
              </div>
            </div>
          )}

          {/* Property Grid */}
          {!loading && !error && filteredProperties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => {
                const progress = calculateProgress(property.availableShares, property.totalShares);
                const statusText = getStatusText(property.isActive, property.availableShares, property.totalShares);
                const statusColor = getStatusColor(property.isActive, property.availableShares, property.totalShares);
                
                return (
                  <div 
                    key={property.id} 
                    className="group animate-slide-up cursor-pointer"
                    style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <Card className="glass-card neon-border hover:neon-glow transition-all duration-500 overflow-hidden hover:scale-105">
                      {/* Property Image */}
                      <div className="h-48 relative overflow-hidden">
                        {property.metadata?.images && property.metadata.images.length > 0 ? (
                          <img
                            src={resolveIPFS(property.metadata.images[0])}
                            alt={property.metadata?.title || `Property #${property.id}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              console.error('Thumbnail image failed to load:', e.currentTarget.src);
                              // Fallback to gradient background
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.classList.add('bg-gradient-neon');
                            }}
                          />
                        ) : (
                          <div className="h-full bg-gradient-neon flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                                <div className="w-8 h-8 bg-white rounded"></div>
                              </div>
                              <p className="font-inter text-sm opacity-75">Property #{property.id}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 ${statusColor} text-white px-3 py-1 rounded-full text-sm font-inter font-semibold backdrop-blur-sm`}>
                          {statusText}
                        </div>
                        
                        {/* Blockchain Verified Badge */}
                        <div className="absolute top-4 right-4 bg-neon-green text-white p-2 rounded-full backdrop-blur-sm">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Property Details */}
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-xl font-space font-bold text-dark-text group-hover:electric-text transition-colors">
                            {property.metadata?.title || `Property #${property.id}`}
                          </h3>
                          <div className="flex items-center text-dark-muted">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="font-inter">{property.location}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-dark-muted">
                            {property.metadata?.bedrooms && <span>{property.metadata.bedrooms} bed</span>}
                            {property.metadata?.bathrooms && <span>{property.metadata.bathrooms} bath</span>}
                            {property.metadata?.sqft && <span>{property.metadata.sqft} sqft</span>}
                          </div>
                          {property.metadata?.type && (
                            <Badge variant="outline" className="neon-border electric-text">
                              {property.metadata.type}
                            </Badge>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-inter">
                            <span className="text-dark-muted">Shares Sold</span>
                            <span className="font-semibold text-dark-text">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-dark-border rounded-full h-2">
                            <div 
                              className="bg-gradient-neon h-2 rounded-full transition-all duration-500 animate-glow"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-dark-muted font-inter">
                            {property.availableShares} of {property.totalShares} shares available
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-dark-border">
                          <div>
                            <p className="text-dark-muted font-inter text-sm">Total Value</p>
                            <p className="text-dark-text font-space font-bold electric-text">{property.price} ETH</p>
                          </div>
                          <div>
                            <p className="text-dark-muted font-inter text-sm">Price per Share</p>
                            <p className="text-dark-text font-space font-bold electric-text">
                              {(parseFloat(property.price) / property.totalShares).toFixed(4)} ETH
                            </p>
                          </div>
                        </div>

                        {/* Bottom Stats */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-dark-muted">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="font-inter">
                              {property.totalShares - property.availableShares} investors
                            </span>
                          </div>
                          {property.metadata?.annualYield && (
                            <div className="flex items-center text-neon-green">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              <span className="font-inter font-semibold">{property.metadata.annualYield}% APY</span>
                            </div>
                          )}
                        </div>

                        {/* Property Description */}
                        {property.description && (
                          <p className="text-dark-muted font-inter text-sm line-clamp-2">
                            {property.description}
                          </p>
                        )}

                        {/* CTA Button */}
                        <Button className="w-full bg-gradient-neon text-white font-inter font-semibold py-3 hover:animate-pulse-neon transition-all duration-300 group neon-glow rounded-xl">
                          View Details
                          <div className="ml-2 group-hover:translate-x-1 transition-transform">→</div>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12 animate-slide-up" style={{ animationDelay: '1s' }}>
            <Button 
              variant="default" 
              className="px-8 py-3 glass-card neon-border text-dark-text hover:bg-dark-card/80 font-inter font-semibold"
            >
              Load More Properties
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListings;
