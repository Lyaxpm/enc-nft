import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

/**
 * Encryption utility for secret NFT content.
 * 
 * Strategy:
 * - Each NFT gets a unique symmetric key derived from the owner's signing key + nonce
 * - The secret content is encrypted with NaCl secretbox (XSalsa20-Poly1305)
 * - Only the owner can derive the decryption key by signing a deterministic message
 * - The encrypted payload is stored in the NFT metadata on IPFS
 */

/**
 * Generate an encryption key from a wallet signature.
 * The owner signs a deterministic message to derive the encryption key.
 * This ensures only the owner can decrypt without storing private keys.
 */
export function deriveKeyFromSignature(signature) {
  // Use first 32 bytes of signature as the symmetric key
  const key = new Uint8Array(32);
  const sigBytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature);
  key.set(sigBytes.slice(0, 32));
  return key;
}

/**
 * Encrypt secret content using NaCl secretbox
 * @param {string} plaintext - The secret content to encrypt
 * @param {Uint8Array} key - 32-byte encryption key
 * @returns {object} - { nonce, ciphertext } both as base64 strings
 */
export function encryptSecret(plaintext, key) {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageBytes = naclUtil.decodeUTF8(plaintext);
  const encrypted = nacl.secretbox(messageBytes, nonce, key);

  if (!encrypted) {
    throw new Error('Encryption failed');
  }

  return {
    nonce: naclUtil.encodeBase64(nonce),
    ciphertext: naclUtil.encodeBase64(encrypted),
    algorithm: 'xsalsa20-poly1305',
    version: '1.0',
  };
}

/**
 * Decrypt secret content using NaCl secretbox
 * @param {object} encryptedData - { nonce, ciphertext } as base64 strings
 * @param {Uint8Array} key - 32-byte decryption key
 * @returns {string} - Decrypted plaintext
 */
export function decryptSecret(encryptedData, key) {
  const { nonce, ciphertext } = encryptedData;
  const nonceBytes = naclUtil.decodeBase64(nonce);
  const ciphertextBytes = naclUtil.decodeBase64(ciphertext);

  const decrypted = nacl.secretbox.open(ciphertextBytes, nonceBytes, key);

  if (!decrypted) {
    throw new Error('Decryption failed - you may not be the owner of this NFT');
  }

  return naclUtil.encodeUTF8(decrypted);
}

/**
 * Create the deterministic message that the owner must sign to derive the decryption key.
 * This message is unique per NFT (using tokenId) to prevent key reuse.
 */
export function getSignatureMessage(tokenId) {
  return `Octra Secret NFT: Unlock secret for token #${tokenId}`;
}

/**
 * Full encryption flow for minting
 */
export async function encryptForMint(secretContent, signMessage, tokenId) {
  const message = getSignatureMessage(tokenId);
  const signature = await signMessage(message);
  const key = deriveKeyFromSignature(signature);
  const encrypted = encryptSecret(secretContent, key);
  return encrypted;
}

/**
 * Full decryption flow for unlocking
 */
export async function decryptForOwner(encryptedData, signMessage, tokenId) {
  const message = getSignatureMessage(tokenId);
  const signature = await signMessage(message);
  const key = deriveKeyFromSignature(signature);
  return decryptSecret(encryptedData, key);
}
