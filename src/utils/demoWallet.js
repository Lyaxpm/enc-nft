import nacl from 'tweetnacl';
import { encode as encodeBase58 } from 'bs58';

/**
 * Generate a demo wallet for development/testing when no browser extension is available.
 * This creates a real Ed25519 keypair that can be used for signing and encryption.
 */
export function generateDemoWallet() {
  const keyPair = nacl.sign.keyPair();
  const address = 'oct_' + encodeBase58(keyPair.publicKey).slice(0, 40);
  const publicKey = encodeBase58(keyPair.publicKey);

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
  const { decode: decodeBase58 } = require('bs58');
  const secretKey = decodeBase58(secretKeyBase58);
  const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey);
  const address = 'oct_' + encodeBase58(keyPair.publicKey).slice(0, 40);
  const publicKey = encodeBase58(keyPair.publicKey);

  return {
    address,
    publicKey,
    keyPair,
  };
}
