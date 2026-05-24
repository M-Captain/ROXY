import { ethers } from 'ethers';
import { useWallet } from '@/components/WalletProvider';
import { useCallback, useMemo } from 'react';
import RealEstateListingABI from './RealStateListing.json';
import { number } from 'motion/react';

// You'll need to replace this with your deployed contract address
const CONTRACT_ADDRESS = "0xb3D8C439376f8673d4612C973B545d0F65F98D01";
const KMC_ADDRESS = '0xFe289fBc3cAb7554A6e5c4c55B192594b5B37BbF';
const KMC_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "initialSupply",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

export const useRealEstateContract = () => {
  const { provider, account } = useWallet();

  const getContract = useCallback(async () => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }
    
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, RealEstateListingABI, signer);
  }, [provider, account]);

  const listProperty = useCallback(async (
    location: string,
    description: string,
    priceInETH: string,
    totalShares: number,
    metadataURI: string
  ) => {
    try {
      const contract = await getContract();
      const priceInWei = ethers.parseEther(priceInETH);
      
      const tx = await contract.listProperty(
        location,
        description,
        priceInWei,
        totalShares,
        metadataURI
      );
      
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error listing property:', error);
      throw error;
    }
  }, [getContract]);

  const getProperty = useCallback(async (propertyId: number) => {
    try {
      const contract = await getContract();
      return await contract.getProperty(propertyId);
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }, [getContract]);

  const getTotalProperties = useCallback(async () => {
    try {
      const contract = await getContract();
      // FIXED: Use proper getter function instead of direct state access
      return await contract.getTotalProperties();
    } catch (error) {
      console.error('Error getting total properties:', error);
      throw error;
    }
  }, [getContract]);

  const purchaseShares = useCallback(async (propertyId: number, shares: number, priceInETH: Number) => {
    try {
      const contract = await getContract();
      const signer = await provider.getSigner();
      const kmcToken = new ethers.Contract(KMC_ADDRESS, KMC_ABI, signer);
      const priceInWei = ethers.parseEther(priceInETH); // or the required amount
      await kmcToken.approve(CONTRACT_ADDRESS, priceInWei);
      const tx = await contract.purchaseShares(propertyId, shares);
      
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error purchasing shares:', error);
      throw error;
    }
  }, [getContract, provider]);

  const getAllProperties = useCallback(async () => {
    try {
      const contract = await getContract();
      
      // FIXED: Use proper getter function
      const totalProperties = await contract.getTotalProperties();
      const totalCount = Number(totalProperties);
      
      if (totalCount === 0) {
        return [];
      }
      
      // Fetch all properties using the proper getter function
      const properties = [];
      for (let i = 1; i <= totalCount; i++) {
        try {
          // FIXED: Use getProperty function instead of direct state access
          const property = await contract.getProperty(i);
          
          // Convert BigInt values to regular numbers/strings for easier handling
          const propertyData = {
            id: Number(property.id),
            owner: property.owner,
            location: property.location,
            description: property.description,
            price: ethers.formatEther(property.price),
            totalShares: Number(property.totalShares),
            availableShares: Number(property.availableShares),
            isActive: property.isActive,
            metadataURI: property.metadataURI,
            createdAt: Number(property.createdAt)
          };

          // Fetch metadata from IPFS if available
          let metadata = null;
          if (property.metadataURI) {
            try {
              console.log(`Fetching metadata for property ${i} from URI:`, property.metadataURI);
              
              // Convert ipfs:// to HTTP gateway URL
              let metadataUrl = property.metadataURI;
              if (metadataUrl.startsWith('ipfs://')) {
                const hash = metadataUrl.substring(7);
                metadataUrl = `https://ipfs.io/ipfs/${hash}`;
              }
              
              console.log(`Converted metadata URL for property ${i}:`, metadataUrl);
              
              const response = await fetch(metadataUrl);
              if (response.ok) {
                metadata = await response.json();
                console.log(`Metadata fetched successfully for property ${i}:`, metadata);
              } else {
                console.error(`Failed to fetch metadata for property ${i}, status:`, response.status);
              }
            } catch (error) {
              console.error(`Error fetching metadata for property ${i}:`, error);
            }
          }

          properties.push({ ...propertyData, metadata });
        } catch (error) {
          console.error(`Error fetching property ${i}:`, error);
          // Continue with other properties even if one fails
        }
      }
      
      return properties;
    } catch (error) {
      console.error('Error getting all properties:', error);
      throw error;
    }
  }, [getContract]);

  const getPropertyWithMetadata = useCallback(async (propertyId: number) => {
    try {
      const contract = await getContract();
      // FIXED: Use proper getter function
      const property = await contract.getProperty(propertyId);
      
      const propertyData = {
        id: Number(property.id),
        owner: property.owner,
        location: property.location,
        description: property.description,
        price: ethers.formatEther(property.price),
        totalShares: Number(property.totalShares),
        availableShares: Number(property.availableShares),
        isActive: property.isActive,
        metadataURI: property.metadataURI,
        createdAt: Number(property.createdAt)
      };

      // Fetch metadata from IPFS if available
      let metadata = null;
      if (property.metadataURI) {
        try {
          console.log('Fetching metadata from URI:', property.metadataURI);
          
          // Convert ipfs:// to HTTP gateway URL
          let metadataUrl = property.metadataURI;
          if (metadataUrl.startsWith('ipfs://')) {
            const hash = metadataUrl.substring(7);
            metadataUrl = `https://ipfs.io/ipfs/${hash}`;
          }
          
          console.log('Converted metadata URL:', metadataUrl);
          
          const response = await fetch(metadataUrl);
          if (response.ok) {
            metadata = await response.json();
            console.log('Metadata fetched successfully:', metadata);
          } else {
            console.error('Failed to fetch metadata, status:', response.status);
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      }

      return { ...propertyData, metadata };
    } catch (error) {
      console.error('Error getting property with metadata:', error);
      throw error;
    }
  }, [getContract]);

  // NEW: Additional helper functions
  const getPropertyOwnership = useCallback(async (propertyId: number, owner: string) => {
    try {
      const contract = await getContract();
      return await contract.getPropertyOwnership(propertyId, owner);
    } catch (error) {
      console.error('Error getting property ownership:', error);
      throw error;
    }
  }, [getContract]);

  const getPropertyOwners = useCallback(async (propertyId: number) => {
    try {
      const contract = await getContract();
      return await contract.getPropertyOwners(propertyId);
    } catch (error) {
      console.error('Error getting property owners:', error);
      throw error;
    }
  }, [getContract]);

  const getOwnerProperties = useCallback(async (owner: string) => {
    try {
      const contract = await getContract();
      return await contract.getOwnerProperties(owner);
    } catch (error) {
      console.error('Error getting owner properties:', error);
      throw error;
    }
  }, [getContract]);

  return useMemo(() => ({
    listProperty,
    getProperty,
    getTotalProperties,
    purchaseShares,
    getAllProperties,
    getPropertyWithMetadata,
    getPropertyOwnership,
    getPropertyOwners,
    getOwnerProperties,
    isConnected: !!account
  }), [
    listProperty, 
    getProperty, 
    getTotalProperties, 
    purchaseShares, 
    getAllProperties, 
    getPropertyWithMetadata,
    getPropertyOwnership,
    getPropertyOwners,
    getOwnerProperties,
    account
  ]);
};