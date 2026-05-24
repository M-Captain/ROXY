import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useValuePoster, PropertyValuation } from '@/hooks/use-value-poster';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';

const PropertyValuationTest = () => {
  const [propertyId, setPropertyId] = useState('');
  const [useLongPoll, setUseLongPoll] = useState(false);
  
  const {
    loading,
    error,
    lastResponse,
    requestId,
    isConnected,
    getFullPropertyValuation,
    checkContractStatus,
    manuallyCheckResponse,
    clearError,
    contractAddress,
    subscriptionId
  } = useValuePoster();

  const handleGetValuation = async () => {
    if (!propertyId.trim()) {
      alert('Please enter a property ID');
      return;
    }

    try {
      clearError();
      await getFullPropertyValuation(propertyId.trim(), useLongPoll);
    } catch (err) {
      console.error('Error getting valuation:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark-bg">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Card className="glass-card neon-border">
              <CardContent className="p-8">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-electric-cyan" />
                <h2 className="text-2xl font-space font-bold text-dark-text mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-dark-muted font-inter">
                  Please connect your wallet to test the Chainlink Functions property valuation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl lg:text-5xl font-space font-bold text-dark-text mb-4">
              Property <span className="electric-text">Valuation Test</span>
            </h1>
            <p className="text-xl text-dark-muted font-inter max-w-3xl mx-auto">
              Test your Chainlink Functions integration for real estate property valuation
            </p>
          </div>

          {/* Contract Info */}
          <Card className="glass-card neon-border mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="font-space text-dark-text">Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-dark-muted">Contract Address:</span>
                  <div className="font-mono text-xs text-electric-cyan break-all">
                    {contractAddress}
                  </div>
                </div>
                <div>
                  <span className="text-dark-muted">Subscription ID:</span>
                  <span className="text-dark-text ml-2">{subscriptionId}</span>
                </div>
              </div>
              <Button
                onClick={async () => {
                  try {
                    await checkContractStatus();
                    alert('Check browser console for detailed contract status');
                  } catch (err) {
                    console.error('Status check failed:', err);
                    alert('Failed to check contract status. See console for details.');
                  }
                }}
                className="bg-blue-500 text-white text-sm mr-2"
                size="sm"
              >
                Check Contract Status
              </Button>
              
              <Button
                onClick={async () => {
                  try {
                    const result = await manuallyCheckResponse();
                    if (result.hasResponse) {
                      alert('Response found! Check the console and UI for details.');
                    } else if (result.hasError) {
                      alert(`Error found: ${result.error}`);
                    } else {
                      alert('No response or error data available yet. The request may still be processing.');
                    }
                  } catch (err) {
                    console.error('Manual check failed:', err);
                    alert('Failed to check response. See console for details.');
                  }
                }}
                className="bg-green-500 text-white text-sm"
                size="sm"
              >
                Manual Response Check
              </Button>
            </CardContent>
          </Card>

          {/* Test Interface */}
          <Card className="glass-card neon-border mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle className="font-space text-dark-text">Test Property Valuation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-dark-muted font-inter text-sm mb-2">
                  Property ID
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter property ID (e.g., 1234567)"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                  />
                  <Button
                    onClick={handleGetValuation}
                    disabled={loading}
                    className="bg-gradient-neon text-white font-inter font-semibold hover:animate-pulse-neon transition-all duration-300 neon-glow"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting Valuation...
                      </>
                    ) : (
                      'Get Valuation'
                    )}
                  </Button>
                </div>
                
                {/* Extended Polling Option */}
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    id="longPoll"
                    checked={useLongPoll}
                    onChange={(e) => setUseLongPoll(e.target.checked)}
                    className="mr-2 text-electric-cyan focus:ring-electric-cyan"
                  />
                  <label htmlFor="longPoll" className="text-dark-muted font-inter text-sm">
                    Use extended polling (10 minutes instead of 3.3 minutes)
                  </label>
                </div>
                
                <p className="text-dark-muted font-inter text-xs mt-2">
                  This will call your Chainlink Functions contract to fetch property data from RentCast API
                </p>
              </div>

              {/* Request ID */}
              {requestId && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-inter text-sm">
                      Request ID: 
                    </span>
                  </div>
                  <div className="font-mono text-xs text-blue-300 mt-1 break-all">
                    {requestId}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="p-4 bg-electric-cyan/10 border border-electric-cyan/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-electric-cyan animate-spin" />
                    <span className="text-electric-cyan font-inter text-sm">
                      Chainlink Functions is processing your request...
                    </span>
                  </div>
                  <p className="text-dark-muted font-inter text-xs mt-2">
                    This may take {useLongPoll ? 'up to 10 minutes' : '30-60 seconds'} depending on network conditions and API response times.
                    {useLongPoll && ' Extended polling is enabled for slower requests.'}
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-inter text-sm font-semibold">
                      Error
                    </span>
                  </div>
                  <p className="text-red-400 font-inter text-sm">
                    {error}
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      onClick={clearError}
                      className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      size="sm"
                    >
                      Clear Error
                    </Button>
                    {propertyId && error.includes('Timeout') && (
                      <Button
                        onClick={async () => {
                          try {
                            clearError();
                            setUseLongPoll(true);
                            await getFullPropertyValuation(propertyId.trim(), true);
                          } catch (err) {
                            console.error('Retry failed:', err);
                          }
                        }}
                        disabled={loading}
                        className="text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                        size="sm"
                      >
                        {loading ? 'Retrying...' : 'Retry with Extended Polling'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Success State */}
              {lastResponse && (
                <div className="p-6 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <h4 className="font-inter font-semibold text-neon-green">
                      Property Valuation Results
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-dark-muted text-sm">Property Type:</span>
                        <p className="text-dark-text font-semibold">{lastResponse.propertyType || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-dark-muted text-sm">Bedrooms:</span>
                        <p className="text-dark-text font-semibold">{lastResponse.bedrooms || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-dark-muted text-sm">Bathrooms:</span>
                        <p className="text-dark-text font-semibold">{lastResponse.bathrooms || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-dark-muted text-sm">Square Footage:</span>
                        <p className="text-dark-text font-semibold">{lastResponse.squarefootage?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-dark-muted text-sm">Year Built:</span>
                        <p className="text-dark-text font-semibold">{lastResponse.yearbuilt || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-dark-muted text-sm">Tax Assessment Valuation:</span>
                        <p className="text-neon-green font-space font-bold text-lg">
                          ${lastResponse.valuation?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-neon-green/20">
                    <span className="text-dark-muted text-sm">Formatted Address:</span>
                    <p className="text-dark-text font-semibold">{lastResponse.formattedAddress || 'N/A'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Instructions */}
          <Card className="glass-card neon-border animate-slide-up">
            <CardHeader>
              <CardTitle className="font-space text-dark-text">How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-dark-muted">
                <p>1. Enter a valid property ID from the RentCast database</p>
                <p>2. Click "Get Valuation" to trigger the Chainlink Functions request</p>
                <p>3. Wait for the response (typically 30-60 seconds)</p>
                <p>4. View the property details and valuation returned from the API</p>
                <p className="text-electric-cyan">
                  💡 Try property ID: 1234567 (example ID - replace with real ones)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyValuationTest;
