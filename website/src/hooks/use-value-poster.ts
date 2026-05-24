import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/components/WalletProvider';
import rentcastABI from './rentcastABI.json';

// Contract configuration
const VALUEPOSTER_CONTRACT_ADDRESS = '0xc591886155AF524D8fc3674361D31A7FABa403cE';
const SUBSCRIPTION_ID = 5219;
const GAS_LIMIT = 300000; // Increased gas limit for Functions calls
const DON_ID = '0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000';

export interface PropertyValuation {
  propertyType: string;
  formattedAddress: string;
  bedrooms: number;
  bathrooms: number;
  squarefootage: number;
  yearbuilt: number;
  valuation: number;
}

export const useValuePoster = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<PropertyValuation | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  
  const { provider, account, connected: isConnected } = useWallet();

  const getContract = useCallback(async () => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    const signer = await provider.getSigner();
    return new ethers.Contract(VALUEPOSTER_CONTRACT_ADDRESS, rentcastABI, signer);
  }, [provider, account]);

  const requestPropertyValuation = useCallback(async (propertyId: string) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Requesting property valuation for ID:', propertyId);
      console.log('Contract address:', VALUEPOSTER_CONTRACT_ADDRESS);
      console.log('Subscription ID:', SUBSCRIPTION_ID);
      console.log('Gas limit:', GAS_LIMIT);
      console.log('DON ID:', DON_ID);
      
      const contract = await getContract();
      
      // First, let's check if we're the owner
      try {
        const owner = await contract.owner();
        console.log('Contract owner:', owner);
        console.log('Current account:', account);
        console.log('Is owner?', owner.toLowerCase() === account?.toLowerCase());
      } catch (ownerError) {
        console.warn('Could not check owner:', ownerError);
      }

      // Try to estimate gas first to catch errors early
      try {
        console.log('Estimating gas for transaction...');
        const gasEstimate = await contract.sendGetRequestRentCast.estimateGas(
          SUBSCRIPTION_ID,
          GAS_LIMIT,
          DON_ID,
          propertyId
        );
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (gasError) {
        console.error('Gas estimation failed:', gasError);
        
        // Check if it's an owner-only function
        if (gasError.message.includes('Ownable') || gasError.message.includes('owner')) {
          throw new Error('Only the contract owner can call this function. Please use the owner wallet.');
        }
        
        // Check for other common issues
        if (gasError.message.includes('subscription')) {
          throw new Error('Subscription issue: Please check if subscription ID 5219 exists and has LINK tokens.');
        }
        
        throw new Error(`Transaction would fail: ${gasError.message}`);
      }
      
      // Call the Chainlink Functions request
      console.log('Sending transaction...');
      const tx = await contract.sendGetRequestRentCast(
        SUBSCRIPTION_ID,
        GAS_LIMIT,
        DON_ID,
        propertyId
      );

      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      // Get the request ID from the transaction logs
      const requestIdFromLogs = await contract.s_lastRequestId();
      setRequestId(requestIdFromLogs);
      
      console.log('Chainlink Functions request ID:', requestIdFromLogs);
      
      return {
        requestId: requestIdFromLogs,
        transactionHash: tx.hash
      };
    } catch (err) {
      console.error('Error requesting property valuation:', err);
      
      let errorMessage = 'Failed to request property valuation';
      
      if (err instanceof Error) {
        if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction rejected by user';
        } else if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient ETH for gas fees';
        } else if (err.message.includes('owner')) {
          errorMessage = 'Only contract owner can call this function';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isConnected, getContract, account]);

  const getLastResponse = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getContract();
      
      // Get the last response from the contract
      const lastResponseBytes = await contract.s_lastResponse();
      const lastErrorBytes = await contract.s_lastError();
      
      if (lastErrorBytes && lastErrorBytes !== '0x') {
        const errorString = ethers.toUtf8String(lastErrorBytes);
        console.error('Chainlink Functions error:', errorString);
        setError(errorString);
        return null;
      }

      if (lastResponseBytes && lastResponseBytes !== '0x') {
        try {
          // Decode the response
          const responseString = ethers.toUtf8String(lastResponseBytes);
          console.log('Raw response:', responseString);
          
          const parsedResponse: PropertyValuation = JSON.parse(responseString);
          console.log('Parsed response:', parsedResponse);
          
          setLastResponse(parsedResponse);
          return parsedResponse;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          setError('Failed to parse property valuation response');
          return null;
        }
      }

      console.log('No response available yet');
      return null;
    } catch (err) {
      console.error('Error getting last response:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
      setError(errorMessage);
      return null;
    }
  }, [isConnected, getContract]);

  const pollForResponse = useCallback(async (maxAttempts = 40, intervalMs = 5000) => {
    let attempts = 0;
    let lastRequestId = '';
    
    const poll = async (): Promise<PropertyValuation | null> => {
      if (attempts >= maxAttempts) {
        console.log('Polling timeout reached. Last request ID:', lastRequestId);
        setError(`Timeout waiting for Chainlink Functions response after ${attempts} attempts (${(attempts * intervalMs) / 1000} seconds). Request may still be processing.`);
        return null;
      }

      attempts++;
      console.log(`Polling for response, attempt ${attempts}/${maxAttempts}`);
      
      try {
        // Check contract status first
        const contract = await getContract();
        const currentRequestId = await contract.s_lastRequestId();
        
        if (currentRequestId !== lastRequestId) {
          console.log('New request ID detected:', currentRequestId);
          lastRequestId = currentRequestId;
        }
        
        // Check for errors first
        const lastErrorBytes = await contract.s_lastError();
        if (lastErrorBytes && lastErrorBytes !== '0x') {
          const errorString = ethers.toUtf8String(lastErrorBytes);
          console.error('Chainlink Functions error detected:', errorString);
          setError(`Chainlink Functions error: ${errorString}`);
          return null;
        }
        
        // Check for response
        const response = await getLastResponse();
        
        if (response) {
          console.log('Response received after', attempts, 'attempts:', response);
          return response;
        }
        
        console.log(`No response yet. Waiting ${intervalMs}ms before next check...`);
        
      } catch (pollError) {
        console.error(`Error during polling attempt ${attempts}:`, pollError);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      return poll();
    };

    return poll();
  }, [getLastResponse, getContract]);

  const longPollForResponse = useCallback(async (maxAttempts = 60, intervalMs = 10000) => {
    console.log(`Starting long polling: ${maxAttempts} attempts with ${intervalMs}ms intervals (total: ${(maxAttempts * intervalMs) / 1000 / 60} minutes)`);
    let attempts = 0;
    let lastRequestId = '';
    
    const poll = async (): Promise<PropertyValuation | null> => {
      if (attempts >= maxAttempts) {
        console.log('Long polling timeout reached. Last request ID:', lastRequestId);
        setError(`Long timeout waiting for Chainlink Functions response after ${attempts} attempts (${(attempts * intervalMs) / 1000 / 60} minutes). The request may have failed or still be processing.`);
        return null;
      }

      attempts++;
      const remainingTime = ((maxAttempts - attempts) * intervalMs) / 1000 / 60;
      console.log(`Long polling attempt ${attempts}/${maxAttempts} (${remainingTime.toFixed(1)} minutes remaining)`);
      
      try {
        // Check contract status first
        const contract = await getContract();
        const currentRequestId = await contract.s_lastRequestId();
        
        if (currentRequestId !== lastRequestId) {
          console.log('New request ID detected:', currentRequestId);
          lastRequestId = currentRequestId;
        }
        
        // Check for errors first
        const lastErrorBytes = await contract.s_lastError();
        if (lastErrorBytes && lastErrorBytes !== '0x') {
          const errorString = ethers.toUtf8String(lastErrorBytes);
          console.error('Chainlink Functions error detected:', errorString);
          
          // Don't immediately fail on "Request failed: true" - this might be transient
          if (errorString.includes('Request failed: true')) {
            console.log('Request failed error detected, but continuing to poll in case of retry...');
          } else {
            setError(`Chainlink Functions error: ${errorString}`);
            return null;
          }
        }
        
        // Check for response
        const response = await getLastResponse();
        
        if (response) {
          console.log('Response received after', attempts, 'long polling attempts:', response);
          return response;
        }
        
        console.log(`No response yet. Waiting ${intervalMs / 1000} seconds before next check...`);
        
      } catch (pollError) {
        console.error(`Error during long polling attempt ${attempts}:`, pollError);
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      return poll();
    };

    return poll();
  }, [getLastResponse, getContract]);

  const listenForResponse = useCallback(async (timeoutMs = 60000): Promise<PropertyValuation | null> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getContract();
      
      return new Promise((resolve, reject) => {
        let resolved = false;
        
        // Set up timeout
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log('Event listener timeout reached');
            resolve(null); // Don't reject, just return null to continue with polling
          }
        }, timeoutMs);
        
        // Listen for Response event
        const responseFilter = contract.filters.Response();
        
        const handleResponse = async (requestId: string, response: string, err: string, event: any) => {
          if (resolved) return;
          
          console.log('Response event received:', {
            requestId,
            response,
            error: err,
            blockNumber: event.blockNumber
          });
          
          clearTimeout(timeout);
          resolved = true;
          
          if (err && err !== '0x' && err !== '') {
            const errorString = ethers.toUtf8String(err);
            console.error('Response event contains error:', errorString);
            setError(`Chainlink Functions error: ${errorString}`);
            resolve(null);
            return;
          }
          
          if (response && response !== '0x' && response !== '') {
            try {
              const responseString = ethers.toUtf8String(response);
              console.log('Response event data:', responseString);
              
              const parsedResponse: PropertyValuation = JSON.parse(responseString);
              console.log('Parsed response from event:', parsedResponse);
              
              setLastResponse(parsedResponse);
              resolve(parsedResponse);
            } catch (parseError) {
              console.error('Error parsing response from event:', parseError);
              setError('Failed to parse property valuation response from event');
              resolve(null);
            }
          } else {
            console.log('Response event has empty response');
            resolve(null);
          }
        };
        
        contract.on(responseFilter, handleResponse);
        
        // Clean up listener when done
        setTimeout(() => {
          contract.off(responseFilter, handleResponse);
        }, timeoutMs + 1000);
      });
      
    } catch (err) {
      console.error('Error setting up response listener:', err);
      return null;
    }
  }, [isConnected, getContract]);

  const getFullPropertyValuation = useCallback(async (propertyId: string, useLongPoll = true): Promise<PropertyValuation | null> => {
    try {
      console.log('Starting full property valuation process for ID:', propertyId);
      console.log('Using long poll by default:', useLongPoll);
      
      // Step 1: Request valuation
      const requestResult = await requestPropertyValuation(propertyId);
      console.log('Request submitted:', requestResult);
      
      // Step 2: Skip event listening and go directly to long polling for better reliability
      console.log('Skipping event listening, going directly to long polling for better reliability...');
      
      // Step 3: Use long polling by default since Chainlink Functions can take time
      if (useLongPoll) {
        console.log('Starting extended polling (up to 10 minutes)...');
        const pollResponse = await longPollForResponse();
        return pollResponse;
      } else {
        console.log('Starting standard polling (up to 3.3 minutes)...');
        const pollResponse = await pollForResponse();
        return pollResponse;
      }
    } catch (err) {
      console.error('Error in full property valuation:', err);
      throw err;
    }
  }, [requestPropertyValuation, pollForResponse, longPollForResponse]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryWithExtendedPolling = useCallback(async (propertyId: string): Promise<PropertyValuation | null> => {
    try {
      console.log('Retrying with extended polling for property ID:', propertyId);
      clearError();
      
      // Use the extended polling directly
      return await getFullPropertyValuation(propertyId, true);
    } catch (err) {
      console.error('Error in retry with extended polling:', err);
      throw err;
    }
  }, [getFullPropertyValuation, clearError]);

  const checkContractStatus = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getContract();
      
      // Check basic contract info
      const owner = await contract.owner();
      const lastRequestId = await contract.s_lastRequestId();
      const lastResponse = await contract.s_lastResponse();
      const lastError = await contract.s_lastError();
      
      console.log('=== Contract Status ===');
      console.log('Contract Address:', VALUEPOSTER_CONTRACT_ADDRESS);
      console.log('Owner:', owner);
      console.log('Current Account:', account);
      console.log('Is Owner?', owner.toLowerCase() === account?.toLowerCase());
      console.log('Last Request ID:', lastRequestId);
      console.log('Last Response (raw):', lastResponse);
      console.log('Last Error (raw):', lastError);
      console.log('Subscription ID:', SUBSCRIPTION_ID);
      console.log('DON ID:', DON_ID);
      
      // Try to decode response and error if they exist
      if (lastResponse && lastResponse !== '0x') {
        try {
          const responseString = ethers.toUtf8String(lastResponse);
          console.log('Last Response (decoded):', responseString);
        } catch (e) {
          console.log('Could not decode response as UTF-8');
        }
      } else {
        console.log('No response data available');
      }
      
      if (lastError && lastError !== '0x') {
        try {
          const errorString = ethers.toUtf8String(lastError);
          console.log('Last Error (decoded):', errorString);
        } catch (e) {
          console.log('Could not decode error as UTF-8');
        }
      } else {
        console.log('No error data available');
      }
      
      console.log('======================');
      
      return {
        owner,
        isOwner: owner.toLowerCase() === account?.toLowerCase(),
        lastRequestId,
        lastResponse,
        lastError,
        contractAddress: VALUEPOSTER_CONTRACT_ADDRESS,
        subscriptionId: SUBSCRIPTION_ID,
        donId: DON_ID
      };
    } catch (err) {
      console.error('Error checking contract status:', err);
      throw err;
    }
  }, [isConnected, getContract, account]);

  const manuallyCheckResponse = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const contract = await getContract();
      const lastResponse = await contract.s_lastResponse();
      const lastError = await contract.s_lastError();
      
      console.log('=== Manual Response Check ===');
      console.log('Raw Response:', lastResponse);
      console.log('Raw Error:', lastError);
      
      if (lastError && lastError !== '0x') {
        const errorString = ethers.toUtf8String(lastError);
        console.log('Decoded Error:', errorString);
        setError(`Chainlink Functions Error: ${errorString}`);
        return { hasError: true, error: errorString };
      }
      
      if (lastResponse && lastResponse !== '0x') {
        const responseString = ethers.toUtf8String(lastResponse);
        console.log('Decoded Response:', responseString);
        
        try {
          const parsedResponse = JSON.parse(responseString);
          console.log('Parsed Response:', parsedResponse);
          setLastResponse(parsedResponse);
          return { hasResponse: true, response: parsedResponse };
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          setError(`Response parsing failed: ${parseError.message}`);
          return { hasError: true, error: `Invalid JSON: ${responseString}` };
        }
      }
      
      console.log('No response or error data found');
      return { hasResponse: false, hasError: false };
    } catch (err) {
      console.error('Error manually checking response:', err);
      throw err;
    }
  }, [isConnected, getContract]);

  return {
    // State
    loading,
    error,
    lastResponse,
    requestId,
    isConnected,
    
    // Functions
    requestPropertyValuation,
    getLastResponse,
    pollForResponse,
    longPollForResponse,
    getFullPropertyValuation,
    retryWithExtendedPolling,
    clearError,
    checkContractStatus,
    manuallyCheckResponse,
    
    // Contract info
    contractAddress: VALUEPOSTER_CONTRACT_ADDRESS,
    subscriptionId: SUBSCRIPTION_ID
  };
};

export default useValuePoster;
