import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { getNFTsByOwner } from '../services/nftStorage';

export default function MyNFTs() {
  const { wallet, isConnected, connect } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'listed', 'unlisted'

  useEffect(() => {
    if (isConnected && wallet) {
      const myNfts = getNFTsByOwner(wallet.address);
      setNfts(myNfts);
    }
  }, [wallet, isConnected]);

  const filteredNFTs = nfts.filter(nft => {
    if (filter === 'listed') return nft.listed;
    if (filter === 'unlisted') return !nft.listed;
    return true;
  });

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="card !p-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-octra-600/10 border border-octra-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-octra-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">My NFTs</h2>
          <p className="text-dark-400 mb-6">Connect your wallet to view and manage your Secret NFTs</p>
          <button onClick={connect} className="btn-primary">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">My NFTs</h1>
          <p className="text-dark-400">Manage your Secret NFTs - sell, transfer, or view secrets</p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'listed', 'unlisted'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-octra-600/20 text-octra-300 border border-octra-500/30'
                  : 'text-dark-400 hover:text-white bg-dark-800 border border-dark-600'
              }`}
            >
              {f === 'all' ? `All (${nfts.length})` : f === 'listed' ? `Listed (${nfts.filter(n => n.listed).length})` : `Unlisted (${nfts.filter(n => !n.listed).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{nfts.length}</p>
          <p className="text-xs text-dark-400 mt-1">Total NFTs</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{nfts.filter(n => n.listed).length}</p>
          <p className="text-xs text-dark-400 mt-1">Listed</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {nfts.filter(n => n.listed && n.price > 0).reduce((sum, n) => sum + n.price, 0).toFixed(2)}
          </p>
          <p className="text-xs text-dark-400 mt-1">Total Value (OCT)</p>
        </div>
        <div className="card !p-4 text-center">
          <p className="text-2xl font-bold text-white">{nfts.filter(n => n.encryptedSecret).length}</p>
          <p className="text-xs text-dark-400 mt-1">With Secrets</p>
        </div>
      </div>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <div className="card !p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-dark-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No NFTs Yet</h3>
          <p className="text-dark-400 mb-6">You haven't minted any Secret NFTs yet.</p>
          <Link to="/mint" className="btn-primary">Mint Your First NFT</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNFTs.map((nft) => (
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
                    <span className="text-xs text-green-300">Listed</span>
                  </div>
                )}

                <div className="absolute top-3 right-3 px-2 py-1 bg-dark-900/80 backdrop-blur-sm rounded-lg border border-octra-500/30 flex items-center gap-1">
                  <svg className="w-3 h-3 text-octra-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-xs text-octra-300">Secret</span>
                </div>
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
                  <span className="text-xs text-dark-500">
                    {new Date(nft.mintedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
