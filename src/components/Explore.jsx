import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { getAllNFTs, getListedNFTs, searchNFTs, getAllCollections } from '../services/nftStorage';

export default function Explore() {
  const { wallet } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'listed', 'recent'
  const [selectedCollection, setSelectedCollection] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price_low', 'price_high', 'name'
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    setCollections(getAllCollections());
  }, []);

  useEffect(() => {
    let results;
    if (filterMode === 'listed') {
      results = getListedNFTs();
    } else {
      results = getAllNFTs();
    }
    setNfts(results);
  }, [filterMode]);

  const filteredNFTs = useMemo(() => {
    let results = [...nfts];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(nft =>
        nft.name?.toLowerCase().includes(q) ||
        nft.description?.toLowerCase().includes(q) ||
        nft.tokenId?.toLowerCase().includes(q) ||
        nft.owner?.toLowerCase().includes(q)
      );
    }

    // Collection filter
    if (selectedCollection) {
      results = results.filter(nft => nft.collectionId === selectedCollection);
    }

    // Price filter
    if (priceRange.min) {
      results = results.filter(nft => nft.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      results = results.filter(nft => nft.price <= parseFloat(priceRange.max));
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        results.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        results.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'recent':
      default:
        results.sort((a, b) => new Date(b.mintedAt) - new Date(a.mintedAt));
        break;
    }

    return results;
  }, [nfts, searchQuery, selectedCollection, priceRange, sortBy]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Explore NFTs</h1>
        <p className="text-dark-400">Discover and collect Secret NFTs from creators on Octra</p>
      </div>

      {/* Search & Filters */}
      <div className="card !p-4 mb-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, token ID, or owner address..."
            className="input-field !pl-11"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter mode tabs */}
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'listed', label: 'For Sale' },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setFilterMode(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterMode === tab.value
                    ? 'bg-octra-600/30 text-octra-300'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Collection filter */}
          {collections.length > 0 && (
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="input-field !w-auto !py-1.5 text-xs"
            >
              <option value="">All Collections</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Price range */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min OCT"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="input-field !w-24 !py-1.5 text-xs"
            />
            <span className="text-dark-500 text-xs">-</span>
            <input
              type="number"
              placeholder="Max OCT"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="input-field !w-24 !py-1.5 text-xs"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field !w-auto !py-1.5 text-xs ml-auto"
          >
            <option value="recent">Recently Added</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-dark-400">
          {filteredNFTs.length} item{filteredNFTs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <div className="card !p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-dark-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No NFTs Found</h3>
          <p className="text-dark-400 mb-6">
            {searchQuery || selectedCollection || priceRange.min || priceRange.max
              ? 'Try adjusting your search or filters.'
              : 'No NFTs have been minted yet. Be the first!'}
          </p>
          <Link to="/mint" className="btn-primary">Create an NFT</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredNFTs.map((nft) => (
            <NFTCard key={nft.tokenId} nft={nft} currentUser={wallet?.address} />
          ))}
        </div>
      )}
    </div>
  );
}

function NFTCard({ nft, currentUser }) {
  const isOwner = nft.owner === currentUser;

  return (
    <Link
      to={`/nft/${nft.tokenId}`}
      className="card group cursor-pointer !p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-dark-800 overflow-hidden">
        {nft.imageUrl ? (
          <img
            src={nft.imageUrl}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-octra-900/30 to-dark-800">
            <svg className="w-16 h-16 text-dark-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        )}

        {/* Secret badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-dark-900/80 backdrop-blur-sm rounded-lg border border-octra-500/30 flex items-center gap-1">
          <svg className="w-3 h-3 text-octra-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs text-octra-300">Secret</span>
        </div>

        {/* Owner badge */}
        {isOwner && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-green-900/80 backdrop-blur-sm rounded-lg border border-green-500/30">
            <span className="text-xs text-green-300">Yours</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-octra-300 transition-colors truncate">
          {nft.name}
        </h3>
        {nft.description && (
          <p className="text-sm text-dark-400 mt-1 line-clamp-1">{nft.description}</p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700/50">
          {nft.listed && nft.price > 0 ? (
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-white">{nft.price}</span>
              <span className="text-xs text-dark-400">OCT</span>
            </div>
          ) : (
            <span className="text-xs text-dark-500">Not listed</span>
          )}
          <span className="text-xs text-dark-500 font-mono">#{nft.tokenId.slice(0, 6)}</span>
        </div>
      </div>
    </Link>
  );
}
