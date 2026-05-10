import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Generate a demo wallet for development/testing when no browser extension is available.
 * This creates a real Ed25519 keypair that can be used for signing and encryption.
 */
export function generateDemoWallet() {
  const keyPair = nacl.sign.keyPair();
  const address = 'oct_' + bs58.encode(keyPair.publicKey).slice(0, 40);
  const publicKey = bs58.encode(keyPair.publicKey);

  return {
    address,
    publicKey,
    keyPair,
  };
}

/**
 * Restore a wallet from a stored seed/key for persistent demo sessions
 */
export function restoreDemoWallet(secretKeyBase58) {
  const secretKey = bs58.decode(secretKeyBase58);
  const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
  const address = 'oct_' + bs58.encode(keyPair.publicKey).slice(0, 40);
  const publicKey = bs58.encode(keyPair.publicKey);

  return {
    address,
    publicKey,
    keyPair,
  };
}
