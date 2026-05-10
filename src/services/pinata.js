/**
 * Pinata IPFS Service
 * Handles uploading images and metadata to IPFS via Pinata.
 * 
 * Required environment variables:
 * - VITE_PINATA_API_KEY
 * - VITE_PINATA_SECRET_KEY
 * - VITE_PINATA_GATEWAY (optional, defaults to gateway.pinata.cloud)
 */

const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

function getHeaders() {
  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('Pinata API keys not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY in .env');
  }

  return {
    pinata_api_key: apiKey,
    pinata_secret_api_key: secretKey,
  };
}

/**
 * Upload a file (image) to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {string} name - Name for the pin
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export async function uploadFileToIPFS(file, name = 'octra-secret-nft') {
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: name,
    keyvalues: {
      app: 'octra-secret-nft',
      type: 'cover-image',
    },
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', options);

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Pinata upload failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    ipfsHash: data.IpfsHash,
    url: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
  };
}

/**
 * Upload NFT metadata JSON to IPFS via Pinata
 * @param {object} metadata - The NFT metadata object
 * @returns {Promise<{ipfsHash: string, url: string}>}
 */
export async function uploadMetadataToIPFS(metadata) {
  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name || 'Octra Secret NFT'} - Metadata`,
        keyvalues: {
          app: 'octra-secret-nft',
          type: 'metadata',
        },
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Pinata metadata upload failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    ipfsHash: data.IpfsHash,
    url: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`,
  };
}

/**
 * Create complete NFT metadata with encrypted secret
 * Following Octra's NFT metadata conventions
 */
export function createNFTMetadata({ name, description, imageUrl, encryptedSecret, owner, tokenId }) {
  return {
    name,
    description,
    image: imageUrl,
    external_url: 'https://octra-secret-nft.app',
    attributes: [
      {
        trait_type: 'Has Secret',
        value: 'Yes',
      },
      {
        trait_type: 'Encryption',
        value: 'XSalsa20-Poly1305',
      },
      {
        trait_type: 'Network',
        value: 'Octra Devnet',
      },
    ],
    properties: {
      encrypted_content: encryptedSecret,
      creator: owner,
      token_id: tokenId,
      created_at: new Date().toISOString(),
      standard: 'OCS-01-NFT',
    },
  };
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchMetadataFromIPFS(ipfsHash) {
  const url = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.status}`);
  }

  return await response.json();
}

/**
 * Check if Pinata is configured
 */
export function isPinataConfigured() {
  return !!(import.meta.env.VITE_PINATA_API_KEY && import.meta.env.VITE_PINATA_SECRET_KEY);
}
