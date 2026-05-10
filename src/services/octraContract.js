/**
 * Octra Secret NFT Contract Service
 * 
 * Handles interaction with the Secret NFT smart contract on Octra Devnet.
 * Contract follows OCS-01-NFT standard with marketplace extensions.
 * 
 * Contract Methods (AppliedML/.aml):
 * - mint(to, token_id, metadata_uri) -> Mint a new NFT
 * - transfer(from, to, token_id) -> Transfer NFT ownership
 * - approve(approved, token_id) -> Approve address for transfer
 * - owner_of(token_id) -> Get owner address
 * - token_uri(token_id) -> Get metadata URI
 * - balance_of(address) -> Get NFT count for address
 * - tokens_of(address) -> Get all token IDs owned by address
 * - list_for_sale(token_id, price) -> List NFT for sale
 * - unlist(token_id) -> Remove listing
 * - buy(token_id) -> Buy a listed NFT
 * - get_listing_price(token_id) -> Get listing price
 * - is_listed(token_id) -> Check if NFT is listed
 */

const OCTRA_DEVNET_RPC = import.meta.env.VITE_OCTRA_RPC_URL || 'https://rpc.devnet.octra.org/rpc';

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
async function sendContractTransaction(method, params, wallet, valueOct = 0) {
  if (wallet.provider && wallet.provider.signAndSendTransaction) {
    return wallet.provider.signAndSendTransaction({
      to: CONTRACT_ADDRESS,
      method,
      params,
      value: valueOct,
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

// ============================================================
// NFT Core Methods
// ============================================================

/**
 * Mint a new Secret NFT
 */
export async function mintNFT(wallet, tokenId, metadataUri) {
  return sendContractTransaction('mint', [wallet.address, tokenId, metadataUri], wallet);
}

/**
 * Transfer an NFT to another address
 */
export async function transferNFT(wallet, from, to, tokenId) {
  return sendContractTransaction('transfer', [from, to, tokenId], wallet);
}

/**
 * Approve an address for transfer
 */
export async function approveNFT(wallet, approved, tokenId) {
  return sendContractTransaction('approve', [approved, tokenId], wallet);
}

/**
 * Get the owner of a token
 */
export async function ownerOf(tokenId) {
  return callContract('owner_of', [tokenId]);
}

/**
 * Get the metadata URI of a token
 */
export async function tokenURI(tokenId) {
  return callContract('token_uri', [tokenId]);
}

/**
 * Get all tokens owned by an address
 */
export async function tokensOf(address) {
  return callContract('tokens_of', [address]);
}

/**
 * Get NFT count for an address
 */
export async function balanceOf(address) {
  return callContract('balance_of', [address]);
}

// ============================================================
// Marketplace Methods
// ============================================================

/**
 * List an NFT for sale
 * @param {object} wallet - Connected wallet
 * @param {string} tokenId - Token to list
 * @param {number} price - Price in OCT (will be converted to raw units)
 */
export async function listForSale(wallet, tokenId, price) {
  const priceRaw = Math.floor(price * 1_000_000); // OCT to raw units
  return sendContractTransaction('list_for_sale', [tokenId, priceRaw], wallet);
}

/**
 * Remove an NFT listing
 */
export async function unlistNFT(wallet, tokenId) {
  return sendContractTransaction('unlist', [tokenId], wallet);
}

/**
 * Buy a listed NFT
 * @param {object} wallet - Buyer wallet
 * @param {string} tokenId - Token to buy
 * @param {number} price - Price in OCT
 */
export async function buyNFT(wallet, tokenId, price) {
  const priceRaw = Math.floor(price * 1_000_000);
  return sendContractTransaction('buy', [tokenId], wallet, priceRaw);
}

/**
 * Get listing price for a token (returns OCT, 0 = not listed)
 */
export async function getListingPrice(tokenId) {
  const result = await callContract('get_listing_price', [tokenId]);
  if (result) return result / 1_000_000;
  return 0;
}

/**
 * Check if a token is listed for sale
 */
export async function isListed(tokenId) {
  return callContract('is_listed', [tokenId]);
}

// ============================================================
// Utility
// ============================================================

/**
 * Generate a unique token ID
 */
export function generateTokenId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export { CONTRACT_ADDRESS, OCTRA_DEVNET_RPC };
