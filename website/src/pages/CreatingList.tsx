import React, { useState, useCallback, useMemo, useRef } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRealEstateContract } from '@/hooks/use-real-estate-contract';
import { useIPFS } from '@/hooks/use-ipfs';
import { useValuePoster } from '@/hooks/use-value-poster';
import { useWallet } from '@/components/WalletProvider';
import { 
  Upload, 
  MapPin, 
  Home, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  Zap,
  Plus,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CreateListing = () => {
  const [step, setStep] = useState(1);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileURIs, setFileURIs] = useState<string[]>([]);
  
  // Chainlink data state
  const [hasChainlinkData, setHasChainlinkData] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    yearBuilt: '',
    description: '',
    propertyValue: '',
    totalTokens: '',
    tokenPrice: '',
    minInvestment: '',
    monthlyRent: '',
    annualYield: '',
    revenueDistribution: '',
  });

  // Hooks
  const { listProperty, isConnected } = useRealEstateContract();
  const { uploadToIPFS, uploadFileToIPFS } = useIPFS();
  const { 
    getFullPropertyValuation, 
    loading: valuationLoading, 
    error: valuationError,
    lastResponse: valuationData,
    clearError 
  } = useValuePoster();
  const { account } = useWallet();

  const updateFormData = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Auto-fill form from address
  const autoFillFromAddress = useCallback(async () => {
    if (!formData.address.trim()) {
      alert('Please enter a property address first');
      return;
    }

    try {
      clearError();
      
      // Use the address directly as the property ID for RentCast
      const propertyId = formData.address.trim();
      
      console.log('Auto-filling form from address (as property ID):', propertyId);
      
      await getFullPropertyValuation(propertyId); // Long polling is now default
      
      // The auto-fill will happen in the useEffect when valuationData changes
    } catch (error) {
      console.error('Auto-fill error:', error);
      alert('Failed to fetch property data from RentCast API. Please check the address format or try again.');
    }
  }, [formData.address, clearError, getFullPropertyValuation]);

  // Auto-fill form fields when valuation data is received
  React.useEffect(() => {
    if (valuationData) {
      console.log('Auto-filling form with valuation data:', valuationData);
      
      // Auto-fill all the form fields
      if (valuationData.propertyType) {
        // Map RentCast property types to our dropdown values
        const typeMapping: { [key: string]: string } = {
          'Single Family': 'single-family',
          'Condo': 'condo',
          'Townhouse': 'townhouse',
          'Manufactured': 'manufactured',
          'Multi-Family': 'multi-family',
          'Apartment': 'apartment',
          'Land': 'land'
        };
        const mappedType = typeMapping[valuationData.propertyType] || valuationData.propertyType.toLowerCase().replace(/\s+/g, '-');
        updateFormData('type', mappedType);
      }
      if (valuationData.formattedAddress) updateFormData('address', valuationData.formattedAddress);
      if (valuationData.bedrooms) updateFormData('bedrooms', valuationData.bedrooms.toString());
      if (valuationData.bathrooms) updateFormData('bathrooms', valuationData.bathrooms.toString());
      if (valuationData.squarefootage) updateFormData('sqft', valuationData.squarefootage.toString());
      if (valuationData.yearbuilt) updateFormData('yearBuilt', valuationData.yearbuilt.toString());
      if (valuationData.valuation) updateFormData('propertyValue', valuationData.valuation.toString());
      
      // Mark that we have Chainlink data
      setHasChainlinkData(true);
    }
  }, [valuationData, updateFormData]);

  const addAmenity = useCallback(() => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  }, [newAmenity, amenities]);

  const removeAmenity = useCallback((amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  }, [amenities]);

  // File change handler
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => file.type.startsWith('image/'));
    console.log('Selected files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    setSelectedFiles(files);
    setUploadingFiles(true);
    const uris: string[] = [];
    
    try {
      for (const file of files) {
        try {
          console.log('Uploading file:', file.name);
          const uri = await uploadFileToIPFS(file);
          console.log('File uploaded, URI:', uri);
          uris.push(uri);
        } catch (err) {
          console.error('File upload failed for', file.name, err);
          alert(`Failed to upload ${file.name}: ${(err as Error).message}`);
        }
      }
      console.log('All files uploaded, URIs:', uris);
      setFileURIs(uris);
    } finally {
      setUploadingFiles(false);
    }
  }, [uploadFileToIPFS]);

  // Drag & drop handlers
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setSelectedFiles(files);
    setUploadingFiles(true);
    const uris: string[] = [];
    try {
      for (const file of files) {
        try {
          const uri = await uploadFileToIPFS(file);
          uris.push(uri);
        } catch (err) {
          console.error('File upload failed for', file.name, err);
          alert(`Failed to upload ${file.name}: ${(err as Error).message}`);
        }
      }
      setFileURIs(uris);
    } finally {
      setUploadingFiles(false);
    }
  }, [uploadFileToIPFS]);
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (uploadingFiles) {
      alert('Please wait for images to finish uploading');
      return;
    }
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate required fields and Chainlink data
    if (!hasChainlinkData) {
      alert('Please use the Auto-Fill button to fetch property data from Chainlink Functions before submitting');
      return;
    }
    
    if (!formData.address || !formData.description || !formData.propertyValue || !formData.totalTokens) {
      alert('Please fill in all required fields: Address, Description, Property Value, and Total Tokens');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare metadata for IPFS
      const metadata = {
        title: formData.title,
        type: formData.type,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        yearBuilt: formData.yearBuilt,
        amenities: amenities,
        images: fileURIs,    // include uploaded image URIs
        tokenPrice: formData.tokenPrice,
        minInvestment: formData.minInvestment,
        monthlyRent: formData.monthlyRent,
        annualYield: formData.annualYield,
        revenueDistribution: formData.revenueDistribution,
        timestamp: new Date().toISOString(),
        creator: account,
      };

      console.log('Metadata to upload:', metadata);

      // Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataURI = await uploadToIPFS(metadata);
      console.log('Metadata uploaded:', metadataURI);

      // Call contract
      console.log('Listing property on blockchain...');
      const receipt = await listProperty(
        formData.address,           // location
        formData.description,       // description
        formData.propertyValue,     // price in ETH
        parseInt(formData.totalTokens), // totalShares
        metadataURI                 // metadataURI
      );

      console.log('Property listed successfully:', receipt);
      alert('Property listed successfully on the blockchain!');
      
      // Reset form or redirect
      // You could redirect to property details or dashboard here
      
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Error submitting property: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, formData, amenities, account, uploadToIPFS, listProperty, fileURIs, uploadingFiles]);

  const steps = [
    { id: 1, title: "Property Details", icon: Home },
    { id: 2, title: "Tokenization", icon: Zap },
    { id: 3, title: "Legal & Compliance", icon: Shield },
    { id: 4, title: "Review & Submit", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl lg:text-5xl font-space font-bold text-dark-text mb-4">
              Create Property <span className="electric-text">Listing</span>
            </h1>
            <p className="text-xl text-dark-muted font-inter max-w-3xl mx-auto">
              Tokenize your real estate property and enable fractional ownership
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-dark-border transform -translate-y-1/2"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-neon transform -translate-y-1/2 transition-all duration-500"
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              ></div>
              
              {steps.map((stepItem) => (
                <div key={stepItem.id} className="flex flex-col items-center relative z-10">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${step >= stepItem.id 
                      ? 'bg-gradient-neon text-white neon-glow' 
                      : 'bg-dark-card border-2 border-dark-border text-dark-muted'
                    }
                  `}>
                    <stepItem.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-inter ${
                    step >= stepItem.id ? 'text-dark-text' : 'text-dark-muted'
                  }`}>
                    {stepItem.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {step === 1 && (
              <Card className="glass-card neon-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-space text-dark-text">Property Information</CardTitle>
                    {hasChainlinkData ? (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified by Chainlink
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Awaiting Chainlink Data
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Property Title</label>
                    <Input
                      placeholder="e.g., Manhattan Luxury Penthouse"
                      className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                    />
                    <p className="text-dark-muted font-inter text-xs mt-1">
                      Property title is manually entered - all other property details are auto-filled via Chainlink Functions
                    </p>
                  </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">
                        Property Type {!hasChainlinkData && <span className="text-orange-400">(Auto-filled by Chainlink)</span>}
                      </label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => hasChainlinkData ? null : updateFormData('type', value)}
                        disabled={hasChainlinkData}
                      >
                        <SelectTrigger className={`bg-dark-card border-dark-border text-dark-text ${hasChainlinkData ? 'opacity-75 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder={hasChainlinkData ? "Populated by Chainlink" : "Select type"} />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-dark-border">
                          <SelectItem value="single-family">Single Family</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="manufactured">Manufactured</SelectItem>
                          <SelectItem value="multi-family">Multi-Family</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">
                      Property Address {hasChainlinkData && <span className="text-green-400">(Verified by Chainlink)</span>}
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder={hasChainlinkData ? "Address verified by Chainlink" : "e.g., 5500 Grand Lake Dr, San Antonio, TX 78244"}
                        className={`bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan flex-1 ${hasChainlinkData ? 'opacity-75' : ''}`}
                        value={formData.address}
                        onChange={(e) => hasChainlinkData ? null : updateFormData('address', e.target.value)}
                        readOnly={hasChainlinkData}
                      />
                      <Button
                        type="button"
                        onClick={autoFillFromAddress}
                        disabled={valuationLoading || !formData.address.trim()}
                        className="bg-electric-cyan text-dark-bg hover:bg-electric-cyan/80 whitespace-nowrap"
                      >
                        {valuationLoading ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full mr-2"></div>
                            Getting Data...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Auto-Fill
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-dark-muted font-inter text-xs mt-2">
                      Enter the property address and click "Auto-Fill" to automatically populate all fields using Chainlink Functions
                    </p>
                  </div>

                  {/* Auto-fill Status Display */}
                  {valuationLoading && (
                    <div className="p-4 bg-electric-cyan/10 border border-electric-cyan/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin w-4 h-4 border-2 border-electric-cyan border-t-transparent rounded-full"></div>
                        <span className="text-electric-cyan font-inter text-sm">
                          Fetching property data from RentCast API via Chainlink Functions...
                        </span>
                      </div>
                      <p className="text-dark-muted font-inter text-xs mt-2">
                        This may take up to 60 seconds. Form fields will be automatically filled when data is received.
                      </p>
                    </div>
                  )}

                  {valuationError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 font-inter text-sm font-semibold">
                          Auto-Fill Failed
                        </span>
                      </div>
                      <p className="text-red-400 font-inter text-sm mb-3">
                        {valuationError}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={() => clearError()}
                          className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          size="sm"
                        >
                          Clear Error
                        </Button>
                        <Button
                          type="button"
                          onClick={autoFillFromAddress}
                          disabled={valuationLoading || !formData.address.trim()}
                          className="text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                          size="sm"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  )}

                  {valuationData && (
                    <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                        <span className="text-neon-green font-inter text-sm font-semibold">
                          Auto-Fill Successful!
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-dark-muted">Property Type:</span>
                          <span className="text-dark-text ml-2">{valuationData.propertyType}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Address:</span>
                          <span className="text-dark-text ml-2">{valuationData.formattedAddress}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Bedrooms:</span>
                          <span className="text-dark-text ml-2">{valuationData.bedrooms}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Bathrooms:</span>
                          <span className="text-dark-text ml-2">{valuationData.bathrooms}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Square Footage:</span>
                          <span className="text-dark-text ml-2">{valuationData.squarefootage?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-dark-muted">Year Built:</span>
                          <span className="text-dark-text ml-2">{valuationData.yearbuilt}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-dark-muted">Tax Assessment Valuation:</span>
                          <span className="text-neon-green ml-2 font-semibold">
                            ${valuationData.valuation?.toLocaleString() || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <p className="text-dark-muted font-inter text-sm">
                        Property data automatically filled from RentCast API via Chainlink Functions. 
                        Fields are now read-only to ensure data integrity.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">
                        Bedrooms {!hasChainlinkData && <span className="text-orange-400">(Auto-filled by Chainlink)</span>}
                      </label>
                      <Input
                        type="number"
                        placeholder={hasChainlinkData ? "Populated by Chainlink" : "3"}
                        className={`bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan ${hasChainlinkData ? 'opacity-75' : ''}`}
                        value={formData.bedrooms}
                        onChange={(e) => hasChainlinkData ? null : updateFormData('bedrooms', e.target.value)}
                        readOnly={hasChainlinkData}
                      />
                    </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">
                        Bathrooms {!hasChainlinkData && <span className="text-orange-400">(Auto-filled by Chainlink)</span>}
                      </label>
                      <Input
                        type="number"
                        placeholder={hasChainlinkData ? "Populated by Chainlink" : "2"}
                        className={`bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan ${hasChainlinkData ? 'opacity-75' : ''}`}
                        value={formData.bathrooms}
                        onChange={(e) => hasChainlinkData ? null : updateFormData('bathrooms', e.target.value)}
                        readOnly={hasChainlinkData}
                      />
                    </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">
                        Square Feet {!hasChainlinkData && <span className="text-orange-400">(Auto-filled by Chainlink)</span>}
                      </label>
                      <Input
                        type="number"
                        placeholder={hasChainlinkData ? "Populated by Chainlink" : "2500"}
                        className={`bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan ${hasChainlinkData ? 'opacity-75' : ''}`}
                        value={formData.sqft}
                        onChange={(e) => hasChainlinkData ? null : updateFormData('sqft', e.target.value)}
                        readOnly={hasChainlinkData}
                      />
                    </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">
                        Year Built {!hasChainlinkData && <span className="text-orange-400">(Auto-filled by Chainlink)</span>}
                      </label>
                      <Input
                        type="number"
                        placeholder={hasChainlinkData ? "Populated by Chainlink" : "2020"}
                        className={`bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan ${hasChainlinkData ? 'opacity-75' : ''}`}
                        value={formData.yearBuilt}
                        onChange={(e) => hasChainlinkData ? null : updateFormData('yearBuilt', e.target.value)}
                        readOnly={hasChainlinkData}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Property Description</label>
                    <Textarea
                      placeholder="Describe your property, its features, and what makes it special..."
                      rows={4}
                      className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Amenities</label>
                    <div className="flex items-center space-x-2 mb-3">
                      <Input
                        placeholder="Add amenity"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
                      />
                      <Button 
                        type="button"
                        onClick={addAmenity}
                        className="bg-gradient-neon text-white neon-glow"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="neon-border electric-text">
                          {amenity}
                          <button
                            onClick={() => removeAmenity(amenity)}
                            className="ml-2 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Property Images</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center hover:border-neon-cyan transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-dark-muted" />
                      <p className="text-dark-muted font-inter">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-dark-muted font-inter text-sm mt-2">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {selectedFiles.map((file, idx) => (
                          <img
                            key={idx}
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Development/Debug Section - Hidden by default */}
                  {process.env.NODE_ENV === 'development' && (
                    <details className="opacity-50">
                      <summary className="text-dark-muted font-inter text-sm mb-2 cursor-pointer">
                        🔧 Developer Override: Property Valuation by Custom ID (Debug Only)
                      </summary>
                      <div className="p-4 glass-card rounded-lg border-orange-500/30 border">
                        <div className="flex flex-col space-y-4">
                          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <p className="text-orange-400 font-inter text-sm">
                              ⚠️ <strong>DEPRECATED:</strong> This section is for development/debugging only. 
                              In production, all property data should come from the Auto-Fill button above.
                            </p>
                          </div>
                          <div>
                            <label className="block text-dark-muted font-inter text-sm mb-2">
                              Custom Property ID (for RentCast API)
                            </label>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Enter property ID (e.g., 1234567)"
                                className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                                id="propertyIdInput"
                              />
                              <Button
                                type="button"
                                onClick={async () => {
                                  const input = document.getElementById('propertyIdInput') as HTMLInputElement;
                                  const propertyId = input?.value?.trim();
                                  if (!propertyId) {
                                    alert('Please enter a property ID');
                                    return;
                                  }
                                  try {
                                    clearError();
                                    await getFullPropertyValuation(propertyId);
                                  } catch (error) {
                                    console.error('Valuation error:', error);
                                  }
                                }}
                                disabled={valuationLoading}
                                className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 whitespace-nowrap"
                              >
                                {valuationLoading ? 'Getting Valuation...' : 'Debug: Get Valuation'}
                              </Button>
                            </div>
                            <p className="text-dark-muted font-inter text-xs mt-2">
                              Debug function: Use this only for testing with specific property IDs.
                            </p>
                          </div>
                        </div>
                      </div>
                    </details>
                  )}

                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Tokenization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">
                        Property Value (ETH) {!hasChainlinkData && <span className="text-orange-400">(Auto-filled by Chainlink)</span>}
                      </label>
                      <Input
                        type="number"
                        placeholder={hasChainlinkData ? "Populated by Chainlink" : "5000"}
                        className={`bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan ${hasChainlinkData ? 'opacity-75' : ''}`}
                        value={formData.propertyValue}
                        onChange={(e) => hasChainlinkData ? null : updateFormData('propertyValue', e.target.value)}
                        readOnly={hasChainlinkData}
                      />
                    </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">Total Tokens</label>
                      <Input
                        type="number"
                        placeholder="10000"
                        className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        value={formData.totalTokens}
                        onChange={(e) => updateFormData('totalTokens', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">Token Price (ETH)</label>
                      <Input
                        type="number"
                        placeholder="0.5"
                        className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        value={formData.tokenPrice}
                        onChange={(e) => updateFormData('tokenPrice', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">Minimum Investment (ETH)</label>
                      <Input
                        type="number"
                        placeholder="0.1"
                        className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        value={formData.minInvestment}
                        onChange={(e) => updateFormData('minInvestment', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">Expected Monthly Rent (ETH)</label>
                      <Input
                        type="number"
                        placeholder="25"
                        className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        value={formData.monthlyRent}
                        onChange={(e) => updateFormData('monthlyRent', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-dark-muted font-inter text-sm mb-2">Expected Annual Yield (%)</label>
                      <Input
                        type="number"
                        placeholder="12.5"
                        className="bg-dark-card border-dark-border text-dark-text placeholder:text-dark-muted focus:border-neon-cyan"
                        value={formData.annualYield}
                        onChange={(e) => updateFormData('annualYield', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Revenue Distribution</label>
                    <Select
                      value={formData.revenueDistribution}
                      onValueChange={(value) => updateFormData('revenueDistribution', value)}
                    >
                      <SelectTrigger className="bg-dark-card border-dark-border text-dark-text">
                        <SelectValue placeholder="Select distribution frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-dark-border">
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Token Economics Preview */}
                  <div className="p-6 glass-card rounded-lg neon-border">
                    <h4 className="font-space font-bold text-dark-text mb-4">Token Economics Preview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-dark-muted font-inter text-sm">Total Value</p>
                        <p className="font-space font-bold electric-text">5,000 ETH</p>
                      </div>
                      <div>
                        <p className="text-dark-muted font-inter text-sm">Token Supply</p>
                        <p className="font-space font-bold text-dark-text">10,000 Tokens</p>
                      </div>
                      <div>
                        <p className="text-dark-muted font-inter text-sm">Price per Token</p>
                        <p className="font-space font-bold electric-text">0.5 ETH</p>
                      </div>
                      <div>
                        <p className="text-dark-muted font-inter text-sm">Expected APY</p>
                        <p className="font-space font-bold text-neon-green">12.5%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Legal & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Property Deed</label>
                    <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-neon-cyan transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-dark-muted" />
                      <p className="text-dark-muted font-inter text-sm">Upload property deed document</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Property Appraisal</label>
                    <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-neon-cyan transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-dark-muted" />
                      <p className="text-dark-muted font-inter text-sm">Upload recent property appraisal</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-dark-muted font-inter text-sm mb-2">Insurance Documentation</label>
                    <div className="border-2 border-dashed border-dark-border rounded-lg p-6 text-center hover:border-neon-cyan transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-dark-muted" />
                      <p className="text-dark-muted font-inter text-sm">Upload insurance certificates</p>
                    </div>
                  </div>

                  {/* Legal Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="ownership"
                        className="mt-1 w-4 h-4 rounded border-dark-border bg-dark-card focus:ring-neon-cyan"
                      />
                      <label htmlFor="ownership" className="text-dark-muted font-inter text-sm">
                        I confirm that I have legal ownership of this property and the right to tokenize it.
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="compliance"
                        className="mt-1 w-4 h-4 rounded border-dark-border bg-dark-card focus:ring-neon-cyan"
                      />
                      <label htmlFor="compliance" className="text-dark-muted font-inter text-sm">
                        I understand and agree to comply with all applicable securities laws and regulations.
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 w-4 h-4 rounded border-dark-border bg-dark-card focus:ring-neon-cyan"
                      />
                      <label htmlFor="terms" className="text-dark-muted font-inter text-sm">
                        I have read and agree to the platform's terms of service and tokenization agreement.
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card className="glass-card neon-border">
                <CardHeader>
                  <CardTitle className="font-space text-dark-text">Review & Submit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 glass-card rounded-lg neon-border">
                    <h4 className="font-space font-bold text-dark-text mb-4">Property Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-inter font-semibold text-dark-text mb-2">Property Details</h5>
<div className="space-y-1 text-sm">
  <p className="text-dark-muted">Title: <span className="text-dark-text">{formData.title || 'N/A'}</span></p>
  <p className="text-dark-muted">Type: <span className="text-dark-text">{formData.type || 'N/A'}</span></p>
  <p className="text-dark-muted">Location: <span className="text-dark-text">{formData.address || 'N/A'}</span></p>
  <p className="text-dark-muted">Size: <span className="text-dark-text">{formData.sqft ? `${formData.sqft} sq ft` : 'N/A'}</span></p>
</div>

                      </div>
                      <div>
                        <h5 className="font-inter font-semibold text-dark-text mb-2">Tokenization</h5>
<div className="space-y-1 text-sm">
  <p className="text-dark-muted">Total Value: <span className="electric-text font-semibold">{formData.propertyValue || 'N/A'} ETH</span></p>
  <p className="text-dark-muted">Total Tokens: <span className="text-dark-text">{formData.totalTokens || 'N/A'}</span></p>
  <p className="text-dark-muted">Token Price: <span className="electric-text font-semibold">{formData.tokenPrice || 'N/A'} ETH</span></p>
  <p className="text-dark-muted">Expected APY: <span className="text-neon-green font-semibold">{formData.annualYield || 'N/A'}%</span></p>
</div>

                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-electric-cyan/10 border border-electric-cyan/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-electric-cyan mt-0.5" />
                      <div>
                        <p className="font-inter font-semibold text-dark-text">Ready for Review</p>
                        <p className="text-dark-muted font-inter text-sm">
                          Your property listing will be reviewed by our team within 24-48 hours. 
                          You'll receive an email notification once the review is complete.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="default"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="neon-border text-dark-text hover:bg-dark-card/80 cursor-pointer" 
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={() => setStep(Math.min(4, step + 1))}
                className="bg-gradient-neon text-white font-inter font-semibold hover:animate-pulse-neon transition-all duration-300 neon-glow"
              >
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-neon text-white font-inter font-semibold hover:animate-pulse-neon transition-all duration-300 neon-glow"
                disabled={isSubmitting || uploadingFiles}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;