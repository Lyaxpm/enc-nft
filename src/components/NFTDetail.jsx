import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { decryptSecret, deriveKeyFromSignature, getSignatureMessage } from '../utils/encryption';
import { getNFTByTokenId, listNFTForSale, unlistNFTLocal, recordSale, updateNFTOwner } from '../services/nftStorage';
import { listForSale, unlistNFT, buyNFT, transferNFT } from '../services/octraContract';

export default function NFTDetail() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { wallet, isConnected, signMessage } = useWallet();
  const [nft, setNft] = useState(null);
  const [secretContent, setSecretContent] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Sell modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [isSelling, setIsSelling] = useState(false);

  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Buy state
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    const found = getNFTByTokenId(tokenId);
    if (found) setNft(found);
  }, [tokenId]);

  const isOwner = isConnected && wallet && nft && nft.owner === wallet.address;

  // ============================================================
  // UNLOCK SECRET
  // ============================================================
  const handleUnlock = async () => {
    if (!isOwner) {
      toast.error('Only the NFT owner can unlock the secret');
      return;
    }
    setIsUnlocking(true);
    try {
      const message = getSignatureMessage(tokenId);
      const signature = await signMessage(message);
      const key = deriveKeyFromSignature(signature);
      const decrypted = decryptSecret(nft.encryptedSecret, key);
      setSecretContent(decrypted);
      setIsLocked(false);
      toast.success('Secret unlocked!');
    } catch (error) {
      console.error('Unlock error:', error);
      toast.error('Failed to decrypt. Are you the owner?');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleLock = () => {
    setSecretContent(null);
    setIsLocked(true);
  };

  // ============================================================
  // LIST FOR SALE
  // ============================================================
  const handleListForSale = async () => {
    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    setIsSelling(true);
    try {
      await listForSale(wallet, tokenId, parseFloat(sellPrice));
      listNFTForSale(tokenId, parseFloat(sellPrice));
      setNft(prev => ({ ...prev, listed: true, price: parseFloat(sellPrice) }));
      setShowSellModal(false);
      setSellPrice('');
      toast.success(`Listed for ${sellPrice} OCT!`);
    } catch (error) {
      console.error('List error:', error);
      toast.error('Failed to list NFT');
    } finally {
      setIsSelling(false);
    }
  };

  // ============================================================
  // UNLIST
  // ============================================================
  const handleUnlist = async () => {
    try {
      await unlistNFT(wallet, tokenId);
      unlistNFTLocal(tokenId);
      setNft(prev => ({ ...prev, listed: false, price: 0 }));
      toast.success('NFT unlisted');
    } catch (error) {
      console.error('Unlist error:', error);
      toast.error('Failed to unlist');
    }
  };

  // ============================================================
  // BUY
  // ============================================================
  const handleBuy = async () => {
    if (!isConnected) {
      toast.error('Connect your wallet to buy');
      return;
    }
    if (isOwner) {
      toast.error('You already own this NFT');
      return;
    }
    setIsBuying(true);
    try {
      await buyNFT(wallet, tokenId, nft.price);
      recordSale(tokenId, wallet.address);
      setNft(prev => ({ ...prev, owner: wallet.address, listed: false, price: 0 }));
      toast.success('NFT purchased successfully!');
    } catch (error) {
      console.error('Buy error:', error);
      toast.error('Failed to buy NFT');
    } finally {
      setIsBuying(false);
    }
  };

  // ============================================================
  // TRANSFER
  // ============================================================
  const handleTransfer = async () => {
    if (!transferTo || !transferTo.startsWith('oct_')) {
      toast.error('Please enter a valid Octra address (starts with oct_)');
      return;
    }
    setIsTransferring(true);
    try {
      await transferNFT(wallet, wallet.address, transferTo, tokenId);
      updateNFTOwner(tokenId, transferTo);
      setNft(prev => ({ ...prev, owner: transferTo, listed: false, price: 0 }));
      setShowTransferModal(false);
      setTransferTo('');
      toast.success('NFT transferred!');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('Failed to transfer NFT');
    } finally {
      setIsTransferring(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (!nft) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="card !p-10">
          <h2 className="text-xl font-bold text-white mb-3">NFT Not Found</h2>
          <p className="text-dark-400 mb-6">Token #{tokenId} was not found.</p>
          <Link to="/explore" className="btn-primary">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link to="/explore" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to Explore
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-4">
          <div className="card !p-0 overflow-hidden">
            {nft.imageUrl ? (
              <img src={nft.imageUrl} alt={nft.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-octra-900/20 to-dark-800">
                <svg className="w-24 h-24 text-dark-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
            )}
          </div>

          {/* Properties */}
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-300 mb-3">Properties</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-octra-600/10 border border-octra-500/20 rounded-lg p-2 text-center">
                <p className="text-xs text-octra-400">Network</p>
                <p className="text-xs text-white font-medium mt-0.5">Octra Devnet</p>
              </div>
              <div className="bg-octra-600/10 border border-octra-500/20 rounded-lg p-2 text-center">
                <p className="text-xs text-octra-400">Encryption</p>
                <p className="text-xs text-white font-medium mt-0.5">XSalsa20</p>
              </div>
              <div className="bg-octra-600/10 border border-octra-500/20 rounded-lg p-2 text-center">
                <p className="text-xs text-octra-400">Standard</p>
                <p className="text-xs text-white font-medium mt-0.5">OCS-01-NFT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          {/* Title & badges */}
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-white">{nft.name}</h1>
              {isOwner && (
                <span className="px-2 py-1 bg-green-900/50 border border-green-500/30 rounded-lg text-xs text-green-300">Owner</span>
              )}
              {nft.listed && (
                <span className="px-2 py-1 bg-blue-900/50 border border-blue-500/30 rounded-lg text-xs text-blue-300">For Sale</span>
              )}
            </div>
            {nft.description && (
              <p className="text-dark-300 leading-relaxed">{nft.description}</p>
            )}
          </div>

          {/* Price & Buy/Sell section */}
          {nft.listed && nft.price > 0 && (
            <div className="card !bg-dark-800/50 !border-dark-600">
              <p className="text-sm text-dark-400 mb-1">Current Price</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-white">{nft.price}</span>
                <span className="text-lg text-dark-300">OCT</span>
              </div>
              {!isOwner && isConnected && (
                <button
                  onClick={handleBuy}
                  disabled={isBuying}
                  className="btn-primary w-full !py-3"
                >
                  {isBuying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" className="opacity-75" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                      </svg>
                      Buy Now for {nft.price} OCT
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="card !p-4">
              <h3 className="text-sm font-semibold text-dark-300 mb-3">Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {nft.listed ? (
                  <button onClick={handleUnlist} className="btn-secondary text-sm !py-2.5">
                    Unlist
                  </button>
                ) : (
                  <button onClick={() => setShowSellModal(true)} className="btn-primary text-sm !py-2.5">
                    Sell
                  </button>
                )}
                <button onClick={() => setShowTransferModal(true)} className="btn-secondary text-sm !py-2.5">
                  Transfer
                </button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="card !p-4 space-y-3">
            <InfoRow label="Token ID" value={`#${nft.tokenId}`} mono />
            <InfoRow label="Owner" value={nft.owner} mono truncate />
            <InfoRow label="Minted" value={new Date(nft.mintedAt).toLocaleString()} />
            {nft.collectionId && <InfoRow label="Collection" value={nft.collectionId} />}
          </div>

          {/* Secret Section */}
          <div className={`card !p-0 overflow-hidden border ${isLocked ? 'border-octra-500/30' : 'border-green-500/30'}`}>
            <div className={`px-5 py-3 flex items-center justify-between ${isLocked ? 'bg-octra-600/10' : 'bg-green-600/10'}`}>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isLocked ? 'text-octra-400' : 'text-green-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d={isLocked ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.9-1"} />
                </svg>
                <span className={`text-sm font-medium ${isLocked ? 'text-octra-300' : 'text-green-300'}`}>
                  {isLocked ? 'Secret Content (Locked)' : 'Secret Content (Unlocked)'}
                </span>
              </div>
            </div>

            <div className="p-5">
              {isLocked ? (
                <div className="text-center py-4">
                  {isOwner ? (
                    <>
                      <p className="text-dark-400 text-sm mb-4">Sign a message with your wallet to decrypt the hidden content.</p>
                      <button onClick={handleUnlock} disabled={isUnlocking} className="btn-primary">
                        {isUnlocking ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" className="opacity-25" />
                              <path d="M4 12a8 8 0 018-8" className="opacity-75" />
                            </svg>
                            Unlocking...
                          </span>
                        ) : 'Unlock Secret'}
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center">
                        <svg className="w-6 h-6 text-dark-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <p className="text-dark-500 text-sm">Only the NFT owner can unlock this secret.</p>
                      {nft.listed && nft.price > 0 && (
                        <p className="text-octra-400 text-xs">Buy this NFT to access the secret content!</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="bg-dark-800 rounded-xl p-4 border border-green-500/20">
                    <pre className="text-green-200 whitespace-pre-wrap break-words text-sm font-mono">{secretContent}</pre>
                  </div>
                  <button onClick={handleLock} className="mt-3 text-sm text-dark-400 hover:text-white transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Lock again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sell Modal */}
      {showSellModal && (
        <Modal onClose={() => setShowSellModal(false)}>
          <h3 className="text-xl font-bold text-white mb-4">List for Sale</h3>
          <p className="text-dark-400 text-sm mb-4">Set a price for your NFT. Buyers will pay in OCT.</p>
          <div className="mb-4">
            <label className="text-sm text-dark-300 mb-1 block">Price (OCT)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="e.g. 10.00"
              className="input-field"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowSellModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleListForSale} disabled={isSelling} className="btn-primary flex-1">
              {isSelling ? 'Listing...' : 'List for Sale'}
            </button>
          </div>
        </Modal>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <Modal onClose={() => setShowTransferModal(false)}>
          <h3 className="text-xl font-bold text-white mb-4">Transfer NFT</h3>
          <p className="text-dark-400 text-sm mb-4">Send this NFT to another Octra address. This action cannot be undone.</p>
          <div className="mb-4">
            <label className="text-sm text-dark-300 mb-1 block">Recipient Address</label>
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="oct_..."
              className="input-field font-mono text-sm"
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTransferModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleTransfer} disabled={isTransferring} className="btn-primary flex-1">
              {isTransferring ? 'Transferring...' : 'Transfer'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono, truncate }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-dark-400 shrink-0">{label}</span>
      <span className={`text-sm text-dark-200 text-right ${mono ? 'font-mono' : ''} ${truncate ? 'truncate max-w-[200px]' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card !p-6 w-full max-w-md animate-in">
        {children}
      </div>
    </div>
  );
}
