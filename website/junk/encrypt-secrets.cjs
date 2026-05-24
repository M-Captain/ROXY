const { SecretsManager } = require('@chainlink/functions-toolkit');
const { ethers } = require('ethers');

// ...rest of your code


const PRIVATE_KEY = '0d2d012cd28cf87cc9abef0b47a54f10fc6ac2577b1d2ee9de01800ffee1fc41';
const RPC_URL = 'https://endpoints.omniatech.io/v1/eth/sepolia/public';
const FUNCTIONS_ROUTER = '0xb83E47C2bC239B3bf370bc41e1459A34b41238D0';
const DON_ID = 'fun-ethereum-sepolia-1';

const secrets = { apiKey: '45e4527bf0254b9a89cd5cbb345819a8' };

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const secretsManager = new SecretsManager({
    signer: wallet,
    functionsRouterAddress: FUNCTIONS_ROUTER,
    donId: DON_ID,
  });

  await secretsManager.initialize();

  const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);

  console.log('Encrypted secrets hex string:', encryptedSecretsObj.encryptedSecrets);
}

main();
