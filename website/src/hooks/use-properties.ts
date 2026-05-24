import { useState, useEffect, useCallback } from 'react';
import { useRealEstateContract } from './use-real-estate-contract';

export interface Property {
  id: number;
  owner: string;
  location: string;
  description: string;
  price: string; // in ETH
  totalShares: number;
  availableShares: number;
  isActive: boolean;
  metadataURI: string;
  createdAt: number;
  metadata?: {
    title?: string;
    type?: string;
    bedrooms?: string;
    bathrooms?: string;
    sqft?: string;
    yearBuilt?: string;
    amenities?: string[];
    images?: string[]; // IPFS image URLs
    tokenPrice?: string;
    minInvestment?: string;
    monthlyRent?: string;
    annualYield?: string;
    revenueDistribution?: string;
    timestamp?: string;
    creator?: string;
  };
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getAllProperties, getPropertyWithMetadata, isConnected } = useRealEstateContract();

  const fetchProperties = useCallback(async () => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const propertyList = await getAllProperties();
      setProperties(propertyList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(errorMessage);
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllProperties, isConnected]);

  const fetchPropertyWithMetadata = useCallback(async (propertyId: number) => {
    if (!isConnected) return null;
    
    try {
      return await getPropertyWithMetadata(propertyId);
    } catch (err) {
      console.error('Error fetching property with metadata:', err);
      return null;
    }
  }, [getPropertyWithMetadata, isConnected]);

  const refreshProperties = useCallback(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Auto-fetch properties when wallet connects
  useEffect(() => {
    if (isConnected) {
      fetchProperties();
    }
  }, [isConnected, fetchProperties]);

  return {
    properties,
    loading,
    error,
    fetchProperties,
    fetchPropertyWithMetadata,
    refreshProperties,
    isConnected
  };
};

export default useProperties;
