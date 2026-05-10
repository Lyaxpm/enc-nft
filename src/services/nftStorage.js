/**
 * Local NFT Storage Service
 * 
 * IndexedDB/localStorage-backed storage for NFT data.
 * In demo mode (when contract RPC is unavailable), this is the primary data store.
 * In production, the on-chain contract is the source of truth.
 */

const STORAGE_KEY = 'octra_secret_nfts';
const COLLECTIONS_KEY = 'octra_nft_collections';

function getStorageData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nfts: [] };
    return JSON.parse(raw);
  } catch {
    return { nfts: [] };
  }
}

function saveStorageData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCollectionsData() {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) return { collections: [] };
    return JSON.parse(raw);
  } catch {
    return { collections: [] };
  }
}

function saveCollectionsData(data) {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(data));
}

// ============================================================
// NFT CRUD
// ============================================================

/**
 * Store a minted NFT
 */
export function storeNFT(nft) {
  const data = getStorageData();
  data.nfts.push({
    ...nft,
    mintedAt: new Date().toISOString(),
    listed: false,
    price: 0,
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
 * Get all NFTs (for explore/gallery)
 */
export function getAllNFTs() {
  const data = getStorageData();
  return data.nfts;
}

/**
 * Get all listed NFTs (marketplace)
 */
export function getListedNFTs() {
  const data = getStorageData();
  return data.nfts.filter(nft => nft.listed && nft.price > 0);
}

/**
 * Search/filter NFTs
 */
export function searchNFTs({ query = '', collection = '', minPrice = 0, maxPrice = Infinity, listedOnly = false }) {
  const data = getStorageData();
  let results = data.nfts;

  if (listedOnly) {
    results = results.filter(nft => nft.listed && nft.price > 0);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(nft =>
      nft.name?.toLowerCase().includes(q) ||
      nft.description?.toLowerCase().includes(q) ||
      nft.tokenId?.toLowerCase().includes(q) ||
      nft.owner?.toLowerCase().includes(q)
    );
  }

  if (collection) {
    results = results.filter(nft => nft.collectionId === collection);
  }

  if (minPrice > 0) {
    results = results.filter(nft => nft.price >= minPrice);
  }

  if (maxPrice < Infinity) {
    results = results.filter(nft => nft.price <= maxPrice);
  }

  return results;
}

/**
 * Update NFT owner (after transfer or purchase)
 */
export function updateNFTOwner(tokenId, newOwner) {
  const data = getStorageData();
  const nft = data.nfts.find(n => n.tokenId === tokenId);
  if (nft) {
    nft.owner = newOwner;
    nft.listed = false;
    nft.price = 0;
    nft.transferredAt = new Date().toISOString();
    saveStorageData(data);
  }
}

/**
 * List an NFT for sale
 */
export function listNFTForSale(tokenId, price) {
  const data = getStorageData();
  const nft = data.nfts.find(n => n.tokenId === tokenId);
  if (nft) {
    nft.listed = true;
    nft.price = price;
    nft.listedAt = new Date().toISOString();
    saveStorageData(data);
  }
}

/**
 * Unlist an NFT
 */
export function unlistNFTLocal(tokenId) {
  const data = getStorageData();
  const nft = data.nfts.find(n => n.tokenId === tokenId);
  if (nft) {
    nft.listed = false;
    nft.price = 0;
    nft.listedAt = null;
    saveStorageData(data);
  }
}

/**
 * Record a sale (update owner + unlist)
 */
export function recordSale(tokenId, buyer) {
  const data = getStorageData();
  const nft = data.nfts.find(n => n.tokenId === tokenId);
  if (nft) {
    nft.owner = buyer;
    nft.listed = false;
    nft.price = 0;
    nft.listedAt = null;
    nft.transferredAt = new Date().toISOString();
    saveStorageData(data);
  }
}

// ============================================================
// COLLECTIONS
// ============================================================

/**
 * Create a new collection
 */
export function createCollection({ id, name, description, coverImage, owner }) {
  const data = getCollectionsData();
  data.collections.push({
    id,
    name,
    description,
    coverImage,
    owner,
    createdAt: new Date().toISOString(),
  });
  saveCollectionsData(data);
}

/**
 * Get all collections
 */
export function getAllCollections() {
  return getCollectionsData().collections;
}

/**
 * Get collections by owner
 */
export function getCollectionsByOwner(ownerAddress) {
  return getCollectionsData().collections.filter(c => c.owner === ownerAddress);
}

/**
 * Get a collection by ID
 */
export function getCollectionById(collectionId) {
  return getCollectionsData().collections.find(c => c.id === collectionId);
}

/**
 * Get NFTs in a collection
 */
export function getNFTsByCollection(collectionId) {
  const data = getStorageData();
  return data.nfts.filter(nft => nft.collectionId === collectionId);
}

/**
 * Assign NFT to collection
 */
export function assignToCollection(tokenId, collectionId) {
  const data = getStorageData();
  const nft = data.nfts.find(n => n.tokenId === tokenId);
  if (nft) {
    nft.collectionId = collectionId;
    saveStorageData(data);
  }
}

/**
 * Get stats for a collection
 */
export function getCollectionStats(collectionId) {
  const nfts = getNFTsByCollection(collectionId);
  const listed = nfts.filter(n => n.listed);
  const prices = listed.map(n => n.price).filter(p => p > 0);
  return {
    totalItems: nfts.length,
    listedItems: listed.length,
    floorPrice: prices.length > 0 ? Math.min(...prices) : 0,
    totalVolume: prices.reduce((a, b) => a + b, 0),
  };
}

/**
 * Delete all stored data (reset)
 */
export function clearAllNFTs() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COLLECTIONS_KEY);
}
