import axios from 'axios';
import { useCallback, useMemo } from 'react';

export const useIPFS = () => {
  const uploadToIPFS = useCallback(async (data: any): Promise<string> => {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: data,
          pinataMetadata: {
            name: `property-metadata-${Date.now()}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
        }
      );
      
      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }, []);

  const uploadFileToIPFS = useCallback(async (file: File): Promise<string> => {
    try {
      console.log('Uploading file to IPFS:', file.name, 'Size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pinataMetadata', JSON.stringify({
        name: `property-file-${Date.now()}`,
      }));

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
        }
      );
      
      console.log('File uploaded successfully:', response.data);
      const ipfsUrl = `ipfs://${response.data.IpfsHash}`;
      console.log('Generated IPFS URL:', ipfsUrl);
      
      return ipfsUrl;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Failed to upload file to IPFS');
    }
  }, []);

  return useMemo(() => ({ 
    uploadToIPFS, 
    uploadFileToIPFS 
  }), [uploadToIPFS, uploadFileToIPFS]);
};
