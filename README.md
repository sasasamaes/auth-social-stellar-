# auth-social-stellar-# Stellar Auth Module

An authentication and wallet management solution for Stellar blockchain applications. This module provides a seamless integration between modern authentication methods (social login, OTP) and Stellar wallet creation, all powered by Supabase.

[![npm version](https://img.shields.io/npm/v/stellar-auth-module.svg)](https://www.npmjs.com/package/auth-social-stellar)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **Multiple Authentication Methods**
  - Social login (Google, Facebook)
  - Email OTP (One-Time Password)
  - Seamless Supabase integration

- 💳 **Stellar Wallet Management**
  - Automatic wallet creation
  - Secure key storage in Supabase
  - Transaction signing

- 🔒 **Security First**
  - Strong encryption for private keys
  - Keys never stored in plaintext
  - User-specific encryption

- 🧩 **Modular Design**
  - Use the entire package or individual components
  - Easy integration with existing projects
  - Customizable configuration

## Installation

```bash
npm install stellar-auth-module
```

or

```bash
yarn add stellar-auth-module
```

## Prerequisites

- Supabase project with Auth enabled
- Database setup for wallet storage (see below)

## Quick Start

### 1. Set up Supabase

Create the following table in your Supabase database:

```sql
CREATE TABLE wallet_keys (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  public_key VARCHAR NOT NULL,
  encrypted_private_key JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add indexes for performance
CREATE INDEX idx_wallet_keys_user_id ON wallet_keys(user_id);
CREATE INDEX idx_wallet_keys_public_key ON wallet_keys(public_key);
```

### 2. Initialize the module

```typescript
import { StellarAuth } from 'stellar-auth-module';

const auth = new StellarAuth({
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-key',
  encryptionMasterKey: 'your-secure-encryption-key',
});
```

### 3. Implement authentication

```typescript
// Social login with Google
const signInWithGoogle = async () => {
  const { data, error } = await auth.signInWithGoogle();
  if (error) {
    console.error('Error signing in with Google:', error);
    return;
  }
  console.log('Signed in successfully:', data.user);
};

// OTP authentication
const sendOTP = async (email) => {
  const { data, error } = await auth.sendOTP(email);
  if (error) {
    console.error('Error sending OTP:', error);
    return;
  }
  console.log('OTP sent successfully');
};

const verifyOTP = async (email, token) => {
  const { data, error } = await auth.verifyOTP(email, token);
  if (error) {
    console.error('Error verifying OTP:', error);
    return;
  }
  console.log('OTP verified successfully:', data.user);
};
```

### 4. Wallet management

```typescript
// Create and store a wallet for a user
const createWallet = async (userId) => {
  const wallet = await auth.createAndStoreWallet(userId);
  console.log('Wallet created:', wallet.publicKey);
};

// Retrieve wallet information
const getWallet = async (userId) => {
  const wallet = await auth.getWallet(userId);
  console.log('Wallet public key:', wallet.publicKey);
};

// Sign a transaction
const signTransaction = async (userId, transaction) => {
  const signedTransaction = await auth.signTransaction(userId, transaction);
  return signedTransaction;
};
```

## React Integration

Here's an example of how to integrate with React:

```tsx
// StellarAuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { StellarAuth } from 'stellar-auth-module';

const StellarAuthContext = createContext(null);

export const useStellarAuth = () => useContext(StellarAuthContext);

export const StellarAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const auth = new StellarAuth({
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
    supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
    encryptionMasterKey: process.env.REACT_APP_ENCRYPTION_KEY,
  });

  // Authentication methods and state management
  // ...

  const value = {
    user,
    wallet,
    loading,
    loginWithGoogle,
    loginWithFacebook,
    loginWithOTP,
    verifyOTP,
    logout,
    signTransaction,
  };

  return (
    <StellarAuthContext.Provider value={value}>
      {children}
    </StellarAuthContext.Provider>
  );
};
```

## Advanced Usage

### Individual Components

You can also use individual components for advanced customization:

```typescript
import { 
  SocialAuthProvider, 
  OTPAuthProvider,
  StellarWalletManager,
  KeyStorageService,
  EncryptionService 
} from 'stellar-auth-module';

// Custom implementation
// ...
```

### Custom Transaction Signing

For more control over transaction signing:

```typescript
import StellarSdk from 'stellar-sdk';

// Get the wallet and decrypt the private key
const { data } = await keyStorage.getEncryptedKey(userId);
const secretKey = walletManager.decryptSecretKey(data.encrypted_private_key, userId);

// Create a transaction
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const account = await server.loadAccount(publicKey);
const fee = await server.fetchBaseFee();

const transaction = new StellarSdk.TransactionBuilder(account, { 
  fee, 
  networkPassphrase: StellarSdk.Networks.TESTNET 
})
  .addOperation(StellarSdk.Operation.payment({
    destination: recipientPublicKey,
    asset: StellarSdk.Asset.native(),
    amount: '10'
  }))
  .setTimeout(30)
  .build();

// Sign with the decrypted key
const keypair = StellarSdk.Keypair.fromSecret(secretKey);
transaction.sign(keypair);

// Submit to the network
const result = await server.submitTransaction(transaction);
```

## Security Best Practices

- Store the encryption master key in environment variables, never in your code
- Use secure, random values for the encryption master key
- Implement proper session management
- Enable Row Level Security (RLS) in Supabase
- Regularly rotate encryption keys for enhanced security
- Use a secure method to generate the encryption master key:
  ```bash
  openssl rand -hex 32

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [Supabase](https://supabase.io/)
- [React](https://reactjs.org/)

---

Made with ❤️ for the Stellar community