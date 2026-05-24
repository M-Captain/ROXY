import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Zap, 
  Home, 
  Bath, 
  Maximize, 
  Calendar,
  ArrowLeft,
  ExternalLink,
  Copy,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useProperties, Property } from '@/hooks/use-properties';
import { useRealEstateContract } from '@/hooks/use-real-estate-contract';

const PropertyDetails = () => {
  // Helper to convert IPFS URI to HTTP URL
  const resolveIPFS = (uri: string) => {
    console.log('Resolving IPFS URI:', uri);
    if (uri.startsWith('ipfs://')) {
      const hash = uri.substring(7);
      const httpUrl = `https://ipfs.io/ipfs/${hash}`;
      console.log('Converted to HTTP URL:', httpUrl);
      return httpUrl;
    }
    console.log('URI is already HTTP:', uri);
    return uri;
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const { fetchPropertyWithMetadata, isConnected } = useProperties();
  const { purchaseShares } = useRealEstateContract();

  useEffect(() => {
    const loadProperty = async () => {
      if (!id || isNaN(parseInt(id)) || !isConnected) {
        if (!isConnected) return;
        setError('Invalid property ID');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const propertyData = await fetchPropertyWithMetadata(parseInt(id));
        if (propertyData) {
          console.log('Property data loaded:', propertyData);
          console.log('Property metadata:', propertyData.metadata);
          if (propertyData.metadata?.images) {
            console.log('Property images:', propertyData.metadata.images);
          }
          setProperty(propertyData);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError('Failed to load property details');
        console.error('Error loading property:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id, fetchPropertyWithMetadata, isConnected]);

  const handlePurchaseShares = async () => {
    if (!property || !investmentAmount) return;
    
    const amount = parseFloat(investmentAmount);
    if (amount <= 0 || isNaN(amount)) {
      alert('Please enter a valid investment amount');
      return;
    }
    
    const pricePerShare = parseFloat(property.price) / property.totalShares;
    const shares = Math.floor(amount / pricePerShare);
    
    if (shares <= 0) {
      alert('Investment amount too small to purchase even 1 share');
      return;
    }
    
    if (shares > property.availableShares) {
      alert(`Not enough shares available. Maximum available: ${property.availableShares}`);
      return;
    }
    
    // Calculate exact cost for the number of shares being purchased
    const exactCost = shares * pricePerShare;
    
    setPurchasing(true);
    try {
      await purchaseShares(property.id, shares, exactCost.toString());
      alert(`Successfully purchased ${shares} shares for ${exactCost.toFixed(6)} ETH!`);
      
      // Reload property data to reflect the purchase
      const updatedProperty = await fetchPropertyWithMetadata(property.id);
      if (updatedProperty) {
        setProperty(updatedProperty);
        setInvestmentAmount(''); // Clear the input
      }
    } catch (error) {
      console.error('Error purchasing shares:', error);
      alert('Failed to purchase shares: ' + (error as Error).message);
    } finally {
      setPurchasing(false);
    }
  };

  const calculateProgress = () => {
    if (!property) return 0;
    return ((property.totalShares - property.availableShares) / property.totalShares) * 100;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="p-8 glass-card neon-border rounded-lg">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-electric-cyan" />
              <h2 className="text-2xl font-space font-bold text-dark-text mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-dark-muted font-inter">
                Please connect your wallet to view property details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-electric-cyan animate-spin" />
            <p className="text-dark-muted font-inter">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <div className="p-8 glass-card neon-border rounded-lg">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-space font-bold text-dark-text mb-4">
                {error || 'Property Not Found'}
              </h2>
              <Button 
                onClick={() => navigate('/properties')}
                className="bg-gradient-neon text-white font-inter"
              >
                Back to Properties
              </Button>
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
          {/* Back Button */}
          <Button 
            variant="outline" 
            className="mb-6 glass-card neon-border text-dark-text hover:bg-dark-card/80 animate-slide-up"
            onClick={() => navigate('/properties')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Image Placeholder */}
              <div className="h-64 rounded-2xl overflow-hidden relative animate-slide-up">
                {property.metadata?.images && property.metadata.images.length > 0 ? (
                  <img
                    src={resolveIPFS(property.metadata.images[0])}
                    alt={`Property ${property.id}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      console.error('Image src:', e.currentTarget.src);
                    }}
                  />
                ) : (
                  <div className="h-full bg-gradient-neon flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-8 h-8 bg-white rounded"></div>
                      </div>
                      <p className="font-inter text-sm opacity-75">Property #{property.id}</p>
                      {property.metadata?.images ? (
                        <p className="font-inter text-xs opacity-50 mt-2">No images found</p>
                      ) : (
                        <p className="font-inter text-xs opacity-50 mt-2">No image metadata</p>
                      )}
                    </div>
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-4 left-4 ${property.isActive ? 'bg-neon-green' : 'bg-red-500'} text-white px-3 py-1 rounded-full text-sm font-inter font-semibold backdrop-blur-sm`}>
                  {property.isActive ? 'Active' : 'Inactive'}
                </div>
                {/* Blockchain Verified Badge */}
                <div className="absolute top-4 right-4 bg-neon-green text-white p-2 rounded-full backdrop-blur-sm">
                  <Zap className="w-4 h-4" />
                </div>
              </div>

              {/* Property Header */}
              <Card className="glass-card neon-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-space font-bold text-dark-text mb-2">
                        {property.metadata?.title || `Property #${property.id}`}
                      </h1>
                      <div className="flex items-center text-dark-muted mb-2">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span className="font-inter">{property.location}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={`${property.isActive ? 'bg-neon-green' : 'bg-red-500'} text-white`}>
                          {property.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="neon-border electric-text">
                          <Zap className="w-3 h-3 mr-1" />
                          Blockchain Verified
                        </Badge>
                        {property.metadata?.type && (
                          <Badge variant="outline" className="neon-border text-dark-text">
                            {property.metadata.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-space font-bold electric-text">{property.price} ETH</p>
                      <p className="text-dark-muted font-inter">Total Value</p>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-card neon-border rounded-2xl">
                    {property.metadata?.bedrooms && (
                      <div className="text-center">
                        <Home className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                        <p className="text-xl font-space font-bold text-dark-text">{property.metadata.bedrooms}</p>
                        <p className="text-dark-muted font-inter text-sm">Bedrooms</p>
                      </div>
                    )}
                    {property.metadata?.bathrooms && (
                      <div className="text-center">
                        <Bath className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                        <p className="text-xl font-space font-bold text-dark-text">{property.metadata.bathrooms}</p>
                        <p className="text-dark-muted font-inter text-sm">Bathrooms</p>
                      </div>
                    )}
                    {property.metadata?.sqft && (
                      <div className="text-center">
                        <Maximize className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                        <p className="text-xl font-space font-bold text-dark-text">{property.metadata.sqft}</p>
                        <p className="text-dark-muted font-inter text-sm">Sq Ft</p>
                      </div>
                    )}
                    {property.metadata?.yearBuilt && (
                      <div className="text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
                        <p className="text-xl font-space font-bold text-dark-text">{property.metadata.yearBuilt}</p>
                        <p className="text-dark-muted font-inter text-sm">Year Built</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Property Description */}
              <Card className="glass-card neon-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Property Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dark-muted font-inter leading-relaxed mb-6">
                    {property.description || 'No description available for this property.'}
                  </p>
                  
                  {/* Amenities */}
                  {property.metadata?.amenities && property.metadata.amenities.length > 0 && (
                    <div>
                      <h4 className="font-space font-bold text-dark-text mb-4">Amenities</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {property.metadata.amenities.map((amenity, index) => (
                          <div key={index} className="p-3 glass-card rounded-lg">
                            <span className="text-dark-text font-inter text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 glass-card rounded-lg">
                    <h4 className="font-space font-bold text-dark-text mb-2">Property Created</h4>
                    <p className="text-dark-muted font-inter">{formatDate(property.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Investment Panel */}
            <div className="space-y-6">
              {/* Investment Card */}
              <Card className="glass-card neon-border animate-slide-up sticky top-24" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Invest Now</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-inter">
                      <span className="text-dark-muted">Shares Sold</span>
                      <span className="font-semibold text-dark-text">{calculateProgress().toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-dark-border rounded-full h-3">
                      <div 
                        className="bg-gradient-neon h-3 rounded-full transition-all duration-500 animate-glow"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-dark-muted font-inter">
                      {property.availableShares} of {property.totalShares} shares available
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-dark-muted font-inter">Price per Share</span>
                      <span className="font-space font-bold electric-text">
                        {(parseFloat(property.price) / property.totalShares).toFixed(6)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-muted font-inter">Current Investors</span>
                      <span className="font-space font-bold text-dark-text">
                        {property.totalShares - property.availableShares}
                      </span>
                    </div>
                    {property.metadata?.annualYield && (
                      <div className="flex justify-between">
                        <span className="text-dark-muted font-inter">Expected APY</span>
                        <span className="font-space font-bold text-neon-green">{property.metadata.annualYield}%</span>
                      </div>
                    )}
                  </div>

                  {/* Investment Input */}
                  {property.availableShares > 0 && property.isActive ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-dark-muted font-inter text-sm mb-2">Investment Amount (ETH)</label>
                        <Input
                          type="number"
                          placeholder="0.5"
                          value={investmentAmount}
                          onChange={(e) => setInvestmentAmount(e.target.value)}
                          className="w-full bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        />
                        {investmentAmount && (
                          <div className="mt-2 text-sm text-dark-muted">
                            You will receive approximately{' '}
                            {Math.floor(parseFloat(investmentAmount) / (parseFloat(property.price) / property.totalShares))} shares
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={handlePurchaseShares}
                        disabled={!investmentAmount || purchasing || parseFloat(investmentAmount) <= 0}
                        className="w-full bg-gradient-neon text-white font-inter font-semibold py-3 hover:animate-pulse-neon transition-all duration-300 neon-glow disabled:opacity-50"
                      >
                        {purchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Invest Now'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 glass-card rounded-lg text-center">
                      <p className="text-dark-muted font-inter">
                        {!property.isActive 
                          ? 'This property is no longer active for investment.' 
                          : 'All shares have been sold.'}
                      </p>
                    </div>
                  )}

                  {/* Property Owner */}
                  <div className="p-4 glass-card rounded-lg">
                    <h4 className="font-space font-bold text-dark-text mb-2">Property Owner</h4>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-dark-text text-sm">
                        {property.owner.slice(0, 10)}...{property.owner.slice(-8)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(property.owner)}
                        className="neon-border text-dark-text hover:bg-dark-card/80"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full neon-border text-dark-text hover:bg-dark-card/80"
                      onClick={() => window.open(`https://etherscan.io/address/${property.owner}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Etherscan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
