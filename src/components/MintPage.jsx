import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { encryptSecret, deriveKeyFromSignature, getSignatureMessage } from '../utils/encryption';
import { uploadFileToIPFS, uploadMetadataToIPFS, createNFTMetadata, isPinataConfigured } from '../services/pinata';
import { mintNFT, generateTokenId } from '../services/octraContract';
import { storeNFT } from '../services/nftStorage';

export default function MintPage() {
  const { wallet, isConnected, signMessage, connect } = useWallet();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    secretContent: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.secretContent) {
      toast.error('Name and secret content are required');
      return;
    }

    setIsMinting(true);

    try {
      const tokenId = generateTokenId();
      let imageUrl = '';

      // Step 1: Upload image to IPFS
      if (coverImage && isPinataConfigured()) {
        setMintStep('Uploading image to IPFS...');
        const imageResult = await uploadFileToIPFS(coverImage, `${formData.name}-cover`);
        imageUrl = imageResult.url;
      } else if (coverImage) {
        // Demo mode - use local data URL
        imageUrl = imagePreview;
        setMintStep('Using local image (Pinata not configured)...');
      }

      // Step 2: Encrypt secret content
      setMintStep('Encrypting secret content...');
      const message = getSignatureMessage(tokenId);
      const signature = await signMessage(message);
      const key = deriveKeyFromSignature(signature);
      const encryptedSecret = encryptSecret(formData.secretContent, key);

      // Step 3: Create & upload metadata
      setMintStep('Creating metadata...');
      const metadata = createNFTMetadata({
        name: formData.name,
        description: formData.description,
        imageUrl,
        encryptedSecret,
        owner: wallet.address,
        tokenId,
      });

      let metadataUri = '';
      if (isPinataConfigured()) {
        setMintStep('Uploading metadata to IPFS...');
        const metaResult = await uploadMetadataToIPFS(metadata);
        metadataUri = metaResult.url;
      } else {
        metadataUri = `local://${tokenId}`;
      }

      // Step 4: Mint NFT on-chain
      setMintStep('Minting NFT on Octra Devnet...');
      await mintNFT(wallet, tokenId, metadataUri);

      // Step 5: Store locally
      storeNFT({
        tokenId,
        name: formData.name,
        description: formData.description,
        imageUrl,
        metadataUri,
        encryptedSecret,
        owner: wallet.address,
        metadata,
      });

      setMintStep('');
      toast.success('NFT minted successfully!');
      navigate(`/nft/${tokenId}`);
    } catch (error) {
      console.error('Mint error:', error);
      toast.error(error.message || 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
      setMintStep('');
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="card !p-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-octra-600/10 border border-octra-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-octra-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-dark-400 mb-6">Connect your Octra wallet to start minting Secret NFTs</p>
          <button onClick={connect} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Mint Secret NFT</h1>
        <p className="text-dark-400">Create an NFT with hidden encrypted content that only the owner can view.</p>
      </div>

      <form onSubmit={handleMint} className="space-y-6">
        {/* Cover Image */}
        <div className="card">
          <label className="block text-sm font-medium text-dark-200 mb-3">Cover Image</label>
          <div className="relative">
            {imagePreview ? (
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border border-dark-600"
                />
                <button
                  type="button"
                  onClick={() => { setCoverImage(null); setImagePreview(null); }}
                  className="absolute top-3 right-3 p-2 bg-dark-900/80 rounded-lg text-dark-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-dark-600 rounded-xl cursor-pointer hover:border-octra-500/50 transition-colors">
                <svg className="w-10 h-10 text-dark-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
                <span className="text-sm text-dark-400">Click to upload cover image</span>
                <span className="text-xs text-dark-500 mt-1">PNG, JPG, GIF up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="card">
          <label className="block text-sm font-medium text-dark-200 mb-2">
            NFT Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="My Secret NFT"
            className="input-field"
            required
          />
        </div>

        {/* Description */}
        <div className="card">
          <label className="block text-sm font-medium text-dark-200 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="A brief public description of your NFT..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Secret Content */}
        <div className="card border-octra-500/20 bg-gradient-to-br from-dark-900 to-octra-950/20">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-octra-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <label className="text-sm font-medium text-octra-300">
              Secret Content <span className="text-red-400">*</span>
            </label>
          </div>
          <textarea
            value={formData.secretContent}
            onChange={(e) => setFormData(prev => ({ ...prev, secretContent: e.target.value }))}
            placeholder="Enter your secret message, code, link, or any content you want to encrypt..."
            rows={4}
            className="input-field !bg-dark-800/50 !border-octra-500/20 !focus:border-octra-500"
            required
          />
          <p className="mt-2 text-xs text-dark-500 flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            This content will be encrypted. Only the NFT owner can decrypt and view it.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isMinting || !formData.name || !formData.secretContent}
          className="btn-primary w-full !py-4 text-lg"
        >
          {isMinting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" className="opacity-75" />
              </svg>
              {mintStep || 'Minting...'}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Mint Secret NFT
            </span>
          )}
        </button>

        {/* Info box */}
        {!isPinataConfigured() && (
          <div className="card !bg-yellow-900/10 !border-yellow-500/20">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <p className="text-sm text-yellow-300 font-medium">Demo Mode</p>
                <p className="text-xs text-dark-400 mt-1">
                  Pinata IPFS is not configured. Images and metadata will be stored locally. 
                  Set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env for IPFS storage.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
