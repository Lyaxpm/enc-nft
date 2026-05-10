import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

export default function Navbar() {
  const { wallet, isConnected, isConnecting, connect, disconnect, balance } = useWallet();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/mint', label: 'Mint' },
    { path: '/gallery', label: 'Gallery' },
  ];

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <nav className="glass border-b border-dark-700/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-octra-500 to-octra-700 flex items-center justify-center group-hover:animate-glow transition-all">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">
              Octra Secret NFT
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-octra-600/20 text-octra-300 border border-octra-500/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Balance */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800 rounded-lg border border-dark-600">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-dark-200">
                    {balance ? `${parseFloat(balance).toFixed(2)} OCT` : '...'}
                  </span>
                </div>

                {/* Address & Disconnect */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-dark-800 rounded-lg border border-dark-600">
                    <span className="text-sm text-dark-200 font-mono">
                      {truncateAddress(wallet.address)}
                    </span>
                    {wallet.isDemo && (
                      <span className="ml-2 text-xs text-yellow-400">(Demo)</span>
                    )}
                  </div>
                  <button
                    onClick={disconnect}
                    className="p-2 text-dark-400 hover:text-red-400 transition-colors rounded-lg hover:bg-dark-800"
                    title="Disconnect"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="btn-primary text-sm !px-4 !py-2"
              >
                {isConnecting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" className="opacity-75" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                location.pathname === link.path
                  ? 'bg-octra-600/20 text-octra-300 border border-octra-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
