/**
 * Octra Secret NFT Contract Service
 * 
 * Handles interaction with the Secret NFT smart contract on Octra Devnet.
 * Contract follows AppliedML (.aml) syntax from octra-labs/contract-examples.
 * 
 * Contract Methods (AppliedML/.aml):
 * - mint(to, uri) -> int (returns token_id, owner-only)
 * - transfer_nft(token_id, to) -> bool
 * - approve(token_id, to) -> bool
 * - owner_of(token_id) -> address (view)
 * - token_uri(token_id) -> string (view)
 * - balance_of(address) -> int (view)
 * - list_for_sale(token_id, price) -> bool
 * - unlist(token_id) -> bool
 * - buy(token_id) -> bool (payable)
 * - get_listing_price(token_id) -> int (view)
 * - is_listed(token_id) -> int (view, 0 = not listed, >0 = price)
 * - get_name() -> string (view)
 * - get_symbol() -> string (view)
 * - get_total_supply() -> int (view)
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
 * Call a contract view method (read-only)
 */
async function callView(method, params = [], caller = null) {
  return rpcCall('call_view', [
    {
      contract: CONTRACT_ADDRESS,
      method,
      params: params.map(String),
      caller: caller || '',
    },
  ]);
}

/**
 * Send a contract transaction (state-changing)
 */
async function sendContractTransaction(method, params, wallet, valueOct = 0) {
  if (wallet.provider && wallet.provider.signAndSendTransaction) {
    return wallet.provider.signAndSendTransaction({
      to: CONTRACT_ADDRESS,
      method,
      params: params.map(String),
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
 * Contract signature: mint(to: address, uri: string) -> int
 * Note: only contract owner can mint in current contract.
 * token_id is assigned by contract sequentially (0, 1, 2, ...).
 */
export async function mintNFT(wallet, tokenId, metadataUri) {
  return sendContractTransaction('mint', [wallet.address, metadataUri], wallet);
}

/**
 * Transfer an NFT to another address
 * Contract signature: transfer_nft(token_id: int, to: address) -> bool
 */
export async function transferNFT(wallet, from, to, tokenId) {
  return sendContractTransaction('transfer_nft', [tokenId, to], wallet);
}

/**
 * Approve an address for transfer
 * Contract signature: approve(token_id: int, to: address) -> bool
 */
export async function approveNFT(wallet, approved, tokenId) {
  return sendContractTransaction('approve', [tokenId, approved], wallet);
}

/**
 * Get the owner of a token (view)
 */
export async function ownerOf(tokenId) {
  return callView('owner_of', [tokenId]);
}

/**
 * Get the metadata URI of a token (view)
 */
export async function tokenURI(tokenId) {
  return callView('token_uri', [tokenId]);
}

/**
 * Get NFT count for an address (view)
 */
export async function balanceOf(address) {
  return callView('balance_of', [address]);
}

/**
 * Get all tokens owned by an address - fallback to local storage in demo mode.
 * On-chain contract does not expose a tokens_of method; DApp uses localStorage.
 */
export async function tokensOf(address) {
  return null;
}

// ============================================================
// Marketplace Methods
// ============================================================

/**
 * List an NFT for sale
 * Contract signature: list_for_sale(token_id: int, price: int) -> bool
 * @param {number} price - Price in OCT (converted to raw units)
 */
export async function listForSale(wallet, tokenId, price) {
  const priceRaw = Math.floor(price * 1_000_000);
  return sendContractTransaction('list_for_sale', [tokenId, priceRaw], wallet);
}

/**
 * Remove an NFT listing
 * Contract signature: unlist(token_id: int) -> bool
 */
export async function unlistNFT(wallet, tokenId) {
  return sendContractTransaction('unlist', [tokenId], wallet);
}

/**
 * Buy a listed NFT (payable)
 * Contract signature: buy(token_id: int) -> bool
 * @param {number} price - Price in OCT (used as attached value)
 */
export async function buyNFT(wallet, tokenId, price) {
  const priceRaw = Math.floor(price * 1_000_000);
  return sendContractTransaction('buy', [tokenId], wallet, priceRaw);
}

/**
 * Get listing price for a token (returns OCT, 0 = not listed)
 */
export async function getListingPrice(tokenId) {
  const result = await callView('get_listing_price', [tokenId]);
  if (result) return Number(result) / 1_000_000;
  return 0;
}

/**
 * Check if a token is listed for sale
 * Contract returns price (int); 0 = not listed, >0 = listed.
 */
export async function isListed(tokenId) {
  const result = await callView('is_listed', [tokenId]);
  return result && Number(result) > 0;
}

// ============================================================
// Utility
// ============================================================

/**
 * Generate a unique token ID for frontend/demo tracking.
 * Note: on-chain contract assigns sequential int IDs via total_supply.
 * In production, read on-chain token_id from the Mint event or by calling
 * get_total_supply before mint.
 */
export function generateTokenId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export { CONTRACT_ADDRESS, OCTRA_DEVNET_RPC };
