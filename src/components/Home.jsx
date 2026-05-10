import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export default function Home() {
  const { isConnected, connect } = useWallet();

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: 'Encrypted Secrets',
      description: 'Your secret content is encrypted with XSalsa20-Poly1305 and stored on IPFS. Only the owner can decrypt.',
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
      description: 'NFT ownership is recorded on Octra Devnet. The FHE blockchain ensures cryptographic security.',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="10,8 16,12 10,16" />
        </svg>
      ),
      title: 'Owner-Only Unlock',
      description: 'Only the NFT owner can unlock the secret by signing a verification message with their wallet.',
    },
    {
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      title: 'IPFS Storage',
      description: 'Metadata and images are stored on IPFS via Pinata, ensuring permanent decentralized storage.',
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
          <span className="gradient-text">Octra Secret NFT</span>
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Mint NFTs with hidden encrypted content on Octra Devnet. 
          Only the owner can unlock the secret message.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isConnected ? (
            <>
              <Link to="/mint" className="btn-primary text-lg !px-8 !py-4">
                Mint Secret NFT
              </Link>
              <Link to="/gallery" className="btn-secondary text-lg !px-8 !py-4">
                View Gallery
              </Link>
            </>
          ) : (
            <button onClick={connect} className="btn-primary text-lg !px-8 !py-4">
              Connect Wallet to Start
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
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Connect', desc: 'Connect your Octra wallet (0xio or OctWa)' },
            { step: '2', title: 'Create', desc: 'Upload image, add name, description & secret content' },
            { step: '3', title: 'Encrypt & Mint', desc: 'Secret is encrypted and NFT is minted on-chain' },
            { step: '4', title: 'Unlock', desc: 'Only the owner can decrypt and view the secret' },
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

      {/* Tech Stack */}
      <section className="text-center pb-8">
        <p className="text-dark-500 text-sm">
          Built with React + Vite + Tailwind CSS | Smart Contract in Applied (.aml) | IPFS via Pinata | Octra Devnet
        </p>
      </section>
    </div>
  );
}
