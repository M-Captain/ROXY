import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';

const KMC_ADDRESS = '0xFe289fBc3cAb7554A6e5c4c55B192594b5B37BbF';
const SWAP_ADDRESS = '0xE156184E7Eb68564F6E484dBF6750Bf237842f60';
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
const SWAP_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "addLiquidity",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			}
		],
		"name": "getETHAmount",
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
		"name": "getReserves",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "ethReserve",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenReserve",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "ethAmount",
				"type": "uint256"
			}
		],
		"name": "getTokenAmount",
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
		"name": "getTokenPrice",
		"outputs": [
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "reserveETH",
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
		"name": "reserveToken",
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
		"name": "swapEthToToken",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenIn",
				"type": "uint256"
			}
		],
		"name": "swapTokenToEth",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

export function useSwap({ direction, amount }: { direction: 'KMC_TO_ETH' | 'ETH_TO_KMC'; amount: string }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [decimals, setDecimals] = useState(18);

  // Connect wallet (MetaMask)
  const connectWallet = useCallback(async () => {
    let ethereum = window.ethereum;
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
    }
    if (!ethereum || !ethereum.isMetaMask) {
      setError('MetaMask not found. Please install MetaMask to interact with this DApp.');
      alert('Please install MetaMask to interact with this DApp.');
      return;
    }
    try {
      const prov = new ethers.BrowserProvider(ethereum);
      await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setSigner(await prov.getSigner());
      setWalletConnected(true);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Wallet connection failed');
    }
  }, []);

  // Fetch KMC decimals
  useEffect(() => {
    if (!provider) return;
    const fetchDecimals = async () => {
      try {
        const kmc = new ethers.Contract(KMC_ADDRESS, KMC_ABI, provider);
        const dec = await kmc.decimals();
        setDecimals(dec);
        
      } catch(e) {
        console.log(e);
      }
    };
    fetchDecimals();
  }, [provider]);

  // Calculate output and slippage
  useEffect(() => {
    if (!provider || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setOutputAmount('');
      setSlippage(0);
      return;
    }
    const calc = async () => {
      setEstimating(true);
      try {
        const swap = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, provider);


        if (direction === 'KMC_TO_ETH') {
          const ethAmount = await swap.getETHAmount(amount);
          setOutputAmount(ethAmount.toString());
        } else {
          const tokenAmount = await swap.getTokenAmount(amount);
          setOutputAmount(tokenAmount.toString());
        }
      } catch (e: any) {
        setOutputAmount('');
        setSlippage(0);
      }
      setEstimating(false);
    };
    calc();
  }, [provider, amount, direction, decimals]);

  // Check approval
  useEffect(() => {
    if (!provider || !signer || direction !== 'KMC_TO_ETH' || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setNeedsApproval(false);
      return;
    }
    const check = async () => {
      try {
        const kmc = new ethers.Contract(KMC_ADDRESS, KMC_ABI, provider);
        const user = await signer.getAddress();
        const allowance = await kmc.allowance(user, SWAP_ADDRESS);
        const input = ethers.formatEther(amount);
        setNeedsApproval(allowance.lt(input));
      } catch {
        setNeedsApproval(false);
      }
    };
    check();
  }, [provider, signer, direction, amount, decimals]);

  // Approve KMC
  const approve = useCallback(async () => {
    if (!signer || !amount) return;
    setLoading(true);
    setError('');
    try {
      const kmc = new ethers.Contract(KMC_ADDRESS, KMC_ABI, signer);
      const input = ethers.formatEther(amount);
      const tx = await kmc.approve(SWAP_ADDRESS, input);
      await tx.wait();
      setNeedsApproval(false);
    } catch (e: any) {
      setError(e.reason || e.message || 'Approval failed');
    }
    setLoading(false);
  }, [signer, amount, decimals]);

  // Swap
  const swap = useCallback(async () => {
    if (!signer || !amount || !outputAmount) return;
    setLoading(true);
    setError('');
    setTxHash('');
    try {
      const swap = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, signer);
      if (direction === 'KMC_TO_ETH') {
        const gas = await swap.swapTokenToEth.estimateGas(amount);
        console.log(gas);
        const tx = await swap.swapTokenToEth(amount);

      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        setTxHash(receipt.transactionHash);
      } else {
        const tx = await swap.swapEthToToken({
          value: amount, // Convert ETH to wei
      });

      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      return receipt;
      }
    } catch (e: any) {
      setError(e.reason || e.message || 'Swap failed');
    }
    setLoading(false);
  }, [signer, amount, outputAmount, direction, decimals]);

  return {
    outputAmount,
    slippage,
    needsApproval,
    loading,
    error,
    txHash,
    approve,
    swap,
    connectWallet,
    walletConnected,
    estimating,
  };
} 