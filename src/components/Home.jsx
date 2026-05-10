import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { getListedNFTs, getAllNFTs } from '../services/nftStorage';

export default function Home() {
  const { isConnected, connect } = useWallet();
  const [recentNFTs, setRecentNFTs] = useState([]);
  const [listedNFTs, setListedNFTs] = useState([]);

  useEffect(() => {
    const all = getAllNFTs();
    setRecentNFTs(all.slice(-4).reverse());
    setListedNFTs(getListedNFTs().slice(0, 4));
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: 'Encrypted Secrets',
      description: 'Secret content encrypted with XSalsa20-Poly1305, stored on IPFS. Only the owner can decrypt.',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
        </svg>
      ),
      title: 'Marketplace',
      description: 'Buy and sell NFTs directly. List your NFTs with a price and anyone on Octra can purchase.',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      title: 'On-Chain Ownership',
      description: 'NFTs recorded on Octra Devnet with FHE blockchain security. Full ownership and transfer.',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      title: 'Collections',
      description: 'Organize NFTs into curated collections. Browse and discover from other creators.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center pt-12 pb-8">
        <div className="animate-float mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-octra-500 to-octra-800 flex items-center justify-center shadow-2xl shadow-octra-600/30">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="gradient-text">SecretMint</span>
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-4 leading-relaxed">
          The NFT marketplace for Octra with encrypted secret content.
        </p>
        <p className="text-base text-dark-400 max-w-xl mx-auto mb-8">
          Mint, buy, sell, and collect NFTs with hidden encrypted messages. Only the owner can unlock the secret.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/explore" className="btn-primary text-lg !px-8 !py-4">
            Explore NFTs
          </Link>
          {isConnected ? (
            <Link to="/mint" className="btn-secondary text-lg !px-8 !py-4">
              Create NFT
            </Link>
          ) : (
            <button onClick={connect} className="btn-secondary text-lg !px-8 !py-4">
              Connect Wallet
            </button>
          )}
        </div>

        {/* Network badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-dark-800/50 rounded-full border border-dark-700">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-dark-300">Octra Devnet</span>
          <span className="text-xs text-dark-500">|</span>
          <span className="text-sm text-dark-400">FHE Blockchain</span>
        </div>
      </section>

      {/* Listed NFTs (For Sale) */}
      {listedNFTs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">For Sale</h2>
            <Link to="/explore" className="text-sm text-octra-400 hover:text-octra-300 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {listedNFTs.map(nft => (
              <MiniNFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </section>
      )}

      {/* Recent NFTs */}
      {recentNFTs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recently Minted</h2>
            <Link to="/explore" className="text-sm text-octra-400 hover:text-octra-300 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentNFTs.map(nft => (
              <MiniNFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <div key={i} className="card group">
            <div className="w-12 h-12 rounded-xl bg-octra-600/10 border border-octra-500/20 flex items-center justify-center text-octra-400 mb-4 group-hover:border-octra-500/50 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-dark-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="card !p-8">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-5 gap-6">
          {[
            { step: '1', title: 'Connect', desc: 'Connect your Octra wallet (0xio or OctWa)' },
            { step: '2', title: 'Create', desc: 'Upload image, add name & secret content' },
            { step: '3', title: 'Mint', desc: 'Secret is encrypted and NFT minted on-chain' },
            { step: '4', title: 'Sell', desc: 'List your NFT for sale at your price' },
            { step: '5', title: 'Trade', desc: 'Buy NFTs and unlock their secrets' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-octra-500 to-octra-700 flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">
                {item.step}
              </div>
              <h4 className="font-semibold text-white mb-1">{item.title}</h4>
              <p className="text-sm text-dark-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <section className="text-center pb-8">
        <p className="text-dark-500 text-sm">
          Built on Octra Devnet | AppliedML Smart Contracts | IPFS via Pinata | XSalsa20-Poly1305 Encryption
        </p>
      </section>
    </div>
  );
}

function MiniNFTCard({ nft }) {
  return (
    <Link
      to={`/nft/${nft.tokenId}`}
      className="card group cursor-pointer !p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300"
    >
      <div className="relative h-40 bg-dark-800 overflow-hidden">
        {nft.imageUrl ? (
          <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-octra-900/30 to-dark-800">
            <svg className="w-12 h-12 text-dark-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-dark-900/80 backdrop-blur-sm rounded border border-octra-500/30">
          <span className="text-[10px] text-octra-300">Secret</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-white text-sm group-hover:text-octra-300 transition-colors truncate">{nft.name}</h3>
        <div className="flex items-center justify-between mt-2">
          {nft.listed && nft.price > 0 ? (
            <span className="text-xs font-semibold text-white">{nft.price} OCT</span>
          ) : (
            <span className="text-xs text-dark-500">Not listed</span>
          )}
          <span className="text-[10px] text-dark-500 font-mono">#{nft.tokenId.slice(0, 6)}</span>
        </div>
      </div>
    </Link>
  );
}
