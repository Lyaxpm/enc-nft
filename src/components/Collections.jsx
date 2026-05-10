import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { getAllCollections, createCollection, getCollectionStats, getCollectionsByOwner } from '../services/nftStorage';

export default function Collections() {
  const { wallet, isConnected, connect } = useWallet();
  const [collections, setCollections] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCollections();
  }, [viewMode, wallet]);

  function loadCollections() {
    if (viewMode === 'my' && wallet) {
      setCollections(getCollectionsByOwner(wallet.address));
    } else {
      setCollections(getAllCollections());
    }
  }

  const handleCreate = () => {
    if (!newCollection.name.trim()) {
      toast.error('Collection name is required');
      return;
    }
    setIsCreating(true);
    try {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      createCollection({
        id,
        name: newCollection.name,
        description: newCollection.description,
        coverImage: '',
        owner: wallet.address,
      });
      setShowCreateModal(false);
      setNewCollection({ name: '', description: '' });
      loadCollections();
      toast.success('Collection created!');
    } catch (error) {
      toast.error('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Collections</h1>
          <p className="text-dark-400">Curated groups of Secret NFTs</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'all' ? 'bg-octra-600/30 text-octra-300' : 'text-dark-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'my' ? 'bg-octra-600/30 text-octra-300' : 'text-dark-400 hover:text-white'
              }`}
            >
              My Collections
            </button>
          </div>

          {isConnected && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm !py-2">
              + New Collection
            </button>
          )}
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="card !p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-dark-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Collections Yet</h3>
          <p className="text-dark-400 mb-6">
            {viewMode === 'my'
              ? "You haven't created any collections yet."
              : 'No collections exist yet. Create the first one!'}
          </p>
          {isConnected ? (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Collection
            </button>
          ) : (
            <button onClick={connect} className="btn-primary">
              Connect Wallet
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative card !p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Create Collection</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-300 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Collection"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-dark-300 mb-1 block">Description</label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief description..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreate} disabled={isCreating} className="btn-primary flex-1">
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollectionCard({ collection }) {
  const stats = getCollectionStats(collection.id);

  return (
    <Link
      to={`/collection/${collection.id}`}
      className="card group cursor-pointer !p-0 overflow-hidden hover:scale-[1.02] transition-transform duration-300"
    >
      {/* Cover */}
      <div className="h-32 bg-gradient-to-br from-octra-900/40 to-dark-800 flex items-center justify-center">
        <svg className="w-12 h-12 text-dark-600 group-hover:text-octra-500/50 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-octra-300 transition-colors truncate">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-sm text-dark-400 mt-1 line-clamp-2">{collection.description}</p>
        )}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-dark-700/50">
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{stats.totalItems}</p>
            <p className="text-xs text-dark-500">Items</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{stats.floorPrice || '-'}</p>
            <p className="text-xs text-dark-500">Floor</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{stats.listedItems}</p>
            <p className="text-xs text-dark-500">Listed</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
