/**
 * Octra Secret NFT Contract Service
 * 
 * This module handles interaction with the Secret NFT smart contract
 * deployed on Octra Devnet. The contract follows OCS-01 standard
 * adapted for NFTs with encrypted metadata.
 * 
 * Contract Methods (Applied/.aml):
 * - mint(to, token_id, metadata_uri) -> Mint a new NFT
 * - transfer(from, to, token_id) -> Transfer NFT ownership
 * - owner_of(token_id) -> Get owner address
 * - token_uri(token_id) -> Get metadata URI
 * - balance_of(address) -> Get NFT count for address
 * - tokens_of(address) -> Get all token IDs owned by address
 */

const OCTRA_DEVNET_RPC = 'https://rpc.devnet.octra.org/rpc';

// Contract address (deployed on Octra Devnet)
// This should be updated after deploying the contract
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || 'oct_secret_nft_contract_devnet';

/**
 * Make an RPC call to Octra Devnet
 */
async function rpcCall(method, params = []) {
  try {
    const response = await fetch(OCTRA_DEVNET_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'RPC error');
    }

    return data.result;
  } catch (error) {
    // In demo/dev mode, fall back to local simulation
    console.warn('RPC call failed, using demo mode:', error.message);
    return null;
  }
}

/**
 * Call a contract method (read-only)
 */
async function callContract(method, params = []) {
  return rpcCall('call_program', [CONTRACT_ADDRESS, method, ...params]);
}

/**
 * Send a transaction to the contract (state-changing)
 */
async function sendContractTransaction(method, params, wallet) {
  if (wallet.provider && wallet.provider.signAndSendTransaction) {
    return wallet.provider.signAndSendTransaction({
      to: CONTRACT_ADDRESS,
      method,
      params,
    });
  }
  
  // Demo mode simulation
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    hash: '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join(''),
    status: 'confirmed',
  };
}

/**
 * Mint a new Secret NFT
 */
export async function mintNFT(wallet, tokenId, metadataUri) {
  const result = await sendContractTransaction(
    'mint',
    [wallet.address, tokenId, metadataUri],
    wallet
  );
  return result;
}

/**
 * Get the owner of a token
 */
export async function ownerOf(tokenId) {
  const result = await callContract('owner_of', [tokenId]);
  return result;
}

/**
 * Get the metadata URI of a token
 */
export async function tokenURI(tokenId) {
  const result = await callContract('token_uri', [tokenId]);
  return result;
}

/**
 * Get all tokens owned by an address
 */
export async function tokensOf(address) {
  const result = await callContract('tokens_of', [address]);
  return result;
}

/**
 * Get NFT count for an address
 */
export async function balanceOf(address) {
  const result = await callContract('balance_of', [address]);
  return result;
}

/**
 * Transfer an NFT to another address
 */
export async function transferNFT(wallet, from, to, tokenId) {
  const result = await sendContractTransaction(
    'transfer',
    [from, to, tokenId],
    wallet
  );
  return result;
}

/**
 * Generate a unique token ID
 */
export function generateTokenId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export { CONTRACT_ADDRESS, OCTRA_DEVNET_RPC };
