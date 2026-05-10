import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { decryptSecret, deriveKeyFromSignature, getSignatureMessage } from '../utils/encryption';
import { getNFTByTokenId } from '../services/nftStorage';

export default function NFTDetail() {
  const { tokenId } = useParams();
  const { wallet, isConnected, signMessage } = useWallet();
  const [nft, setNft] = useState(null);
  const [secretContent, setSecretContent] = useState(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    const found = getNFTByTokenId(tokenId);
    if (found) {
      setNft(found);
    }
  }, [tokenId]);

  const isOwner = isConnected && wallet && nft && nft.owner === wallet.address;

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

  if (!nft) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="card !p-10">
          <h2 className="text-xl font-bold text-white mb-3">NFT Not Found</h2>
          <p className="text-dark-400 mb-6">Token #{tokenId} was not found.</p>
          <Link to="/gallery" className="btn-primary">Back to Gallery</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/gallery" className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to Gallery
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
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

        {/* Details */}
        <div className="space-y-6">
          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{nft.name}</h1>
              {isOwner && (
                <span className="px-2 py-1 bg-green-900/50 border border-green-500/30 rounded-lg text-xs text-green-300">
                  Owner
                </span>
              )}
            </div>
            {nft.description && (
              <p className="text-dark-300 leading-relaxed">{nft.description}</p>
            )}
          </div>

          {/* Info */}
          <div className="card !p-4 space-y-3">
            <InfoRow label="Token ID" value={`#${nft.tokenId}`} mono />
            <InfoRow label="Owner" value={nft.owner} mono truncate />
            <InfoRow label="Network" value="Octra Devnet" />
            <InfoRow label="Encryption" value="XSalsa20-Poly1305" />
            <InfoRow label="Minted" value={new Date(nft.mintedAt).toLocaleString()} />
          </div>

          {/* Secret Section */}
          <div className={`card !p-0 overflow-hidden border ${isLocked ? 'border-octra-500/30' : 'border-green-500/30'}`}>
            <div className={`px-5 py-3 flex items-center justify-between ${isLocked ? 'bg-octra-600/10' : 'bg-green-600/10'}`}>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isLocked ? 'text-octra-400' : 'text-green-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isLocked ? (
                    <>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </>
                  ) : (
                    <>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </>
                  )}
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
                      <p className="text-dark-400 text-sm mb-4">
                        Sign a message with your wallet to decrypt the hidden content.
                      </p>
                      <button
                        onClick={handleUnlock}
                        disabled={isUnlocking}
                        className="btn-primary"
                      >
                        {isUnlocking ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" className="opacity-25" />
                              <path d="M4 12a8 8 0 018-8" className="opacity-75" />
                            </svg>
                            Unlocking...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                            Unlock Secret
                          </span>
                        )}
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
                      <p className="text-dark-500 text-sm">
                        Only the NFT owner can unlock this secret.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="bg-dark-800 rounded-xl p-4 border border-green-500/20">
                    <pre className="text-green-200 whitespace-pre-wrap break-words text-sm font-mono">
                      {secretContent}
                    </pre>
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
