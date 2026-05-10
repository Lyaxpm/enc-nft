/**
 * Local NFT Storage Service
 * 
 * This provides a local IndexedDB/localStorage-backed storage for NFT data
 * that works alongside the on-chain contract. In demo mode (when contract
 * RPC is unavailable), this serves as the primary data store.
 * 
 * In production, the on-chain contract is the source of truth,
 * and this acts as a cache layer for better UX.
 */

const STORAGE_KEY = 'octra_secret_nfts';
const STORAGE_VERSION = '1.0';

function getStorageData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: STORAGE_VERSION, nfts: [] };
    const data = JSON.parse(raw);
    return data;
  } catch {
    return { version: STORAGE_VERSION, nfts: [] };
  }
}

function saveStorageData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Store a minted NFT
 */
export function storeNFT(nft) {
  const data = getStorageData();
  data.nfts.push({
    ...nft,
    mintedAt: new Date().toISOString(),
  });
  saveStorageData(data);
}

/**
 * Get all NFTs for a specific owner
 */
export function getNFTsByOwner(ownerAddress) {
  const data = getStorageData();
  return data.nfts.filter(nft => nft.owner === ownerAddress);
}

/**
 * Get a specific NFT by token ID
 */
export function getNFTByTokenId(tokenId) {
  const data = getStorageData();
  return data.nfts.find(nft => nft.tokenId === tokenId);
}

/**
 * Get all NFTs (for gallery/explore)
 */
export function getAllNFTs() {
  const data = getStorageData();
  return data.nfts;
}

/**
 * Update NFT owner (after transfer)
 */
export function updateNFTOwner(tokenId, newOwner) {
  const data = getStorageData();
  const nft = data.nfts.find(n => n.tokenId === tokenId);
  if (nft) {
    nft.owner = newOwner;
    nft.transferredAt = new Date().toISOString();
    saveStorageData(data);
  }
}

/**
 * Delete all stored data (reset)
 */
export function clearAllNFTs() {
  localStorage.removeItem(STORAGE_KEY);
}
