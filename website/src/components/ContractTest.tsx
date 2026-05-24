import React, { useState } from 'react';
import { useRealEstateContract } from '@/hooks/use-real-estate-contract';
import { useWallet } from '@/components/WalletProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContractTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { account, connect } = useWallet();
  const { getAllProperties, getTotalProperties, isConnected } = useRealEstateContract();

  const runTests = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: Check connection
      results.push({
        test: 'Wallet Connection',
        result: isConnected ? '✅ Connected' : '❌ Not Connected',
        details: account || 'No account'
      });

      if (isConnected) {
        // Test 2: Get total properties
        try {
          const total = await getTotalProperties();
          results.push({
            test: 'Get Total Properties',
            result: '✅ Success',
            details: `Total properties: ${total}`
          });
        } catch (error) {
          results.push({
            test: 'Get Total Properties',
            result: '❌ Failed',
            details: (error as Error).message
          });
        }

        // Test 3: Get all properties
        try {
          const properties = await getAllProperties();
          results.push({
            test: 'Get All Properties',
            result: '✅ Success',
            details: `Found ${properties.length} properties`
          });

          // Show details of first property if exists
          if (properties.length > 0) {
            results.push({
              test: 'First Property Details',
              result: '✅ Success',
              details: JSON.stringify(properties[0], null, 2)
            });
          }
        } catch (error) {
          results.push({
            test: 'Get All Properties',
            result: '❌ Failed',
            details: (error as Error).message
          });
        }
      }
    } catch (error) {
      results.push({
        test: 'General Error',
        result: '❌ Failed',
        details: (error as Error).message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="font-space text-dark-text">Contract Integration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {!isConnected && (
              <Button onClick={connect} className="bg-gradient-neon text-white">
                Connect Wallet
              </Button>
            )}
            <Button 
              onClick={runTests} 
              disabled={loading}
              className="bg-gradient-neon text-white"
            >
              {loading ? 'Running Tests...' : 'Run Contract Tests'}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-space font-bold text-dark-text">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="p-3 glass-card rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="font-inter font-semibold text-dark-text">{result.test}</span>
                    <span className="text-sm">{result.result}</span>
                  </div>
                  <pre className="text-xs text-dark-muted mt-2 whitespace-pre-wrap">
                    {result.details}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractTest;
