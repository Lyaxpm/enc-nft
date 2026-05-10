import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './components/Home';
import MintPage from './components/MintPage';
import Explore from './components/Explore';
import NFTDetail from './components/NFTDetail';
import MyNFTs from './components/MyNFTs';
import Collections from './components/Collections';
import CollectionDetail from './components/CollectionDetail';

export default function App() {
  return (
    <div className="min-h-screen bg-dark-950 bg-grid">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-octra-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-octra-800/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-octra-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/mint" element={<MintPage />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collection/:collectionId" element={<CollectionDetail />} />
            <Route path="/nft/:tokenId" element={<NFTDetail />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#4c6ef5', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}
