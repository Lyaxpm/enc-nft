import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { getCollectionById, getNFTsByCollection, getCollectionStats } from '../services/nftStorage';

export default function CollectionDetail() {
  const { collectionId } = useParams();
  const { wallet } = useWallet();
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const col = getCollectionById(collectionId);
    if (col) {
      setCollection(col);
      setNfts(getNFTsByCollection(collectionId));
      setStats(getCollectionStats(collectionId));
    }
  }, [collectionId]);

  if (!collection) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="card !p-10">
          <h2 className="text-xl font-bold text-white mb-3">Collection Not Found</h2>
          <p className="text-dark-400 mb-6">This collection does not exist.</p>
          <Link to="/collections" className="btn-primary">Back to Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Link to="/collections" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to Collections
      </Link>

      {/* Collection banner */}
      <div className="card !p-0 overflow-hidden mb-8">
        <div className="h-40 bg-gradient-to-br from-octra-900/40 to-dark-800" />
        <div className="p-6 -mt-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-octra-500 to-octra-700 flex items-center justify-center border-4 border-dark-900">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mt-3">{collection.name}</h1>
          {collection.description && (
            <p className="text-dark-400 mt-1">{collection.description}</p>
          )}
          <p className="text-xs text-dark-500 mt-2 font-mono">by {collection.owner?.slice(0, 12)}...</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
            <p className="text-xs text-dark-400 mt-1">Items</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.listedItems}</p>
            <p className="text-xs text-dark-400 mt-1">Listed</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.floorPrice || '-'}</p>
            <p className="text-xs text-dark-400 mt-1">Floor Price (OCT)</p>
          </div>
          <div className="card !p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.totalVolume.toFixed(2)}</p>
            <p className="text-xs text-dark-400 mt-1">Volume (OCT)</p>
          </div>
        </div>
      )}

      {/* NFTs */}
      {nfts.length === 0 ? (
        <div className="card !p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No NFTs in Collection</h3>
          <p className="text-dark-400 mb-6">This collection is empty. Add NFTs when minting.</p>
          <Link to="/mint" className="btn-primary">Mint NFT</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {nfts.map(nft => (
            <Link
              key={nft.tokenId}
              to={`/nft/${nft.tokenId}`}
              className="card group cursor-pointer !p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="relative h-48 bg-dark-800 overflow-hidden">
                {nft.imageUrl ? (
                  <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-octra-900/30 to-dark-800">
                    <svg className="w-16 h-16 text-dark-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21,15 16,10 5,21" />
                    </svg>
                  </div>
                )}
                {nft.listed && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-green-900/80 backdrop-blur-sm rounded-lg border border-green-500/30">
                    <span className="text-xs text-green-300">For Sale</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white group-hover:text-octra-300 transition-colors truncate">{nft.name}</h3>
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
          ))}
        </div>
      )}
    </div>
  );
}
