# Octra Secret NFT

A decentralized application (DApp) for minting NFTs with encrypted secret content on **Octra Devnet**. Only the NFT owner can decrypt and view the hidden message.

![Octra Secret NFT](https://img.shields.io/badge/Network-Octra%20Devnet-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff)

## Overview

Octra Secret NFT demonstrates how to leverage the Octra blockchain's FHE (Fully Homomorphic Encryption) capabilities to create NFTs that contain encrypted content. The encrypted payload is stored on IPFS, and only the wallet that owns the NFT can derive the decryption key by signing a deterministic message.

### Key Features

- **Connect Wallet** - Integration with 0xio and OctWa wallet extensions
- **Mint NFT** - Upload cover image, add name, description, and secret content
- **Encrypted Secrets** - Secret content encrypted with XSalsa20-Poly1305 (NaCl secretbox)
- **IPFS Storage** - Metadata and images stored on IPFS via Pinata
- **Owner-Only Unlock** - Only the NFT owner can decrypt the secret by signing a verification message
- **NFT Gallery** - Browse and manage your minted NFTs
- **Modern UI** - Built with React + Vite + Tailwind CSS with dark theme

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Wallet  │  │   Mint   │  │  Gallery │  │ Detail │ │
│  │ Connect  │  │   Form   │  │   View   │  │ Unlock │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
└───────┼──────────────┼─────────────┼────────────┼───────┘
        │              │             │            │
        ▼              ▼             ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 0xio/OctWa   │ │  Pinata  │ │  Octra   │ │  NaCl    │
│   Wallet     │ │   IPFS   │ │  Devnet  │ │ Encrypt  │
│  Extension   │ │  Storage │ │   RPC    │ │ /Decrypt │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Encryption Flow

1. **Minting**: A unique token ID is generated. The owner signs a deterministic message (`"Octra Secret NFT: Unlock secret for token #<tokenId>"`) with their wallet. The first 32 bytes of the signature become the symmetric encryption key. The secret content is encrypted with NaCl secretbox.

2. **Unlocking**: The owner signs the same deterministic message for their token. Since the same key + message produces the same signature, the same decryption key is derived. The ciphertext is decrypted and displayed.

3. **Security**: Without the owner's private key, no one can produce the required signature, making decryption impossible for non-owners.

## Smart Contract

The smart contract is written in **Applied** (`.aml`), Octra's native smart contract language. It follows the **OCS-01-NFT** standard.

**Location**: `src/contracts/SecretNFT.aml`

### Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `mint(to, token_id, metadata_uri)` | Write | Mint a new NFT |
| `transfer(from, to, token_id)` | Write | Transfer ownership |
| `approve(approved, token_id)` | Write | Approve transfer |
| `owner_of(token_id)` | Read | Get token owner |
| `token_uri(token_id)` | Read | Get metadata URI |
| `balance_of(address)` | Read | Get NFT count |
| `tokens_of(address)` | Read | Get owner's tokens |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Blockchain | Octra Devnet (FHE) |
| Wallet | 0xio SDK / OctWa SDK |
| Encryption | TweetNaCl (XSalsa20-Poly1305) |
| Storage | IPFS via Pinata |
| Contract | Applied (.aml) |
| Routing | React Router v6 |
| Notifications | React Hot Toast |

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Octra wallet ([0xio](https://chromewebstore.google.com/detail/0xio) or [OctWa](https://chromewebstore.google.com/detail/octwa-octra-wallet/celnpgbeekcppnfbhbkcdaajdbibpdai))
- Pinata account (for IPFS - optional for demo)

### Installation

```bash
# Clone the repository
git clone https://github.com/Lyaxpm/enc-nft.git
cd enc-nft

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Pinata API keys (optional for demo mode)
```

### Configuration

Edit `.env` with your credentials:

```env
# Required for IPFS storage (optional - app works in demo mode without these)
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET_KEY=your_secret_key

# Optional
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Guide

### 1. Deploy the Smart Contract

The smart contract must be deployed via the Octra web client IDE:

1. Open the [Octra Web Client](https://client.octra.org) and connect your wallet
2. Go to **Dev Tools** > **New Project**
3. Import files from `src/contracts/`:
   - `IOCS01NFT.aml` (interface)
   - `SecretNFT.aml` (main contract)
4. Click **Compile** - ensure no errors
5. Click **Deploy** and confirm the transaction
6. Copy the deployed contract address
7. Update `VITE_CONTRACT_ADDRESS` in your `.env`

### 2. Configure Pinata IPFS

1. Create a free account at [Pinata](https://app.pinata.cloud)
2. Go to **API Keys** and create a new key with pinning permissions
3. Copy the API Key and Secret Key to your `.env`

### 3. Deploy Frontend

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

#### Netlify

```bash
npm run build
# Deploy the `dist/` folder to Netlify
```

#### Self-Hosted

```bash
npm run build
# Serve the `dist/` directory with any static file server
npx serve dist
```

## Demo Mode

The app includes a **Demo Mode** that works without a wallet extension or Pinata configuration:

- **No wallet extension**: A local Ed25519 keypair is generated for signing
- **No Pinata keys**: Images are stored as data URLs, metadata is stored locally
- **No RPC access**: Contract interactions are simulated with localStorage

This allows developers to test the full flow without external dependencies.

## Project Structure

```
enc-nft/
├── public/
│   └── octra-logo.svg          # App logo
├── src/
│   ├── components/
│   │   ├── Home.jsx            # Landing page
│   │   ├── MintPage.jsx        # NFT minting form
│   │   ├── Gallery.jsx         # NFT gallery view
│   │   ├── NFTDetail.jsx       # NFT detail + unlock
│   │   └── Navbar.jsx          # Navigation bar
│   ├── contracts/
│   │   ├── IOCS01NFT.aml       # Interface definition
│   │   └── SecretNFT.aml       # Main contract
│   ├── hooks/
│   │   └── useWallet.jsx       # Wallet connection hook
│   ├── services/
│   │   ├── octraContract.js    # Contract interaction
│   │   ├── pinata.js           # IPFS via Pinata
│   │   └── nftStorage.js       # Local NFT storage
│   ├── utils/
│   │   ├── encryption.js       # NaCl encryption/decryption
│   │   └── demoWallet.js       # Demo wallet generation
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── .env.example                # Environment template
├── .gitignore
├── index.html                  # HTML entry
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Security Considerations

- **Key derivation**: Encryption keys are derived from wallet signatures, never stored
- **NaCl secretbox**: Uses XSalsa20 stream cipher with Poly1305 MAC (authenticated encryption)
- **Nonce uniqueness**: Random 24-byte nonces ensure ciphertext uniqueness
- **No key storage**: Private keys never leave the wallet extension
- **IPFS immutability**: Encrypted content on IPFS cannot be altered after minting

## Supported Wallets

| Wallet | Type | Status |
|--------|------|--------|
| [0xio](https://0xio.xyz) | Browser Extension | Supported |
| [OctWa](https://chromewebstore.google.com/detail/octwa-octra-wallet/celnpgbeekcppnfbhbkcdaajdbibpdai) | Browser Extension | Supported |
| [Qiubit](https://chromewebstore.google.com/detail/qiubit-wallet/lhdgoibeniodfnlpapkpelekdffckgjb) | Browser Extension | Coming Soon |
| Demo Mode | Local Keypair | Built-in |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Octra Documentation](https://docs.octra.org)
- [Octra Developer Docs](https://docs.octra.org/developer-docs/building-your-first-program)
- [0xio Wallet Docs](https://docs.0xio.xyz)
- [Pinata IPFS](https://www.pinata.cloud)
- [TweetNaCl.js](https://tweetnacl.js.org)
