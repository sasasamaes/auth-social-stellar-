// index.ts
import { SocialAuthProvider } from './auth/socialAuth';
import { OTPAuthProvider } from './auth/otpAuth';
import { StellarWalletManager } from './wallet/stellarWallet';
import { KeyStorageService } from './wallet/keyStorage';
import { EncryptionService } from './utils/encryption';
import * as StellarSdk from 'stellar-sdk';

export class StellarAuth {
  private socialAuth: SocialAuthProvider;
  private otpAuth: OTPAuthProvider;
  private walletManager: StellarWalletManager;
  private keyStorage: KeyStorageService;
  
  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    encryptionMasterKey: string;
  }) {
    const { supabaseUrl, supabaseKey, encryptionMasterKey } = config;
    
    this.socialAuth = new SocialAuthProvider(supabaseUrl, supabaseKey);
    this.otpAuth = new OTPAuthProvider(supabaseUrl, supabaseKey);
    
    const encryptionService = new EncryptionService(encryptionMasterKey);
    this.walletManager = new StellarWalletManager(encryptionService);
    this.keyStorage = new KeyStorageService(supabaseUrl, supabaseKey);
  }

  // Social login methods
  signInWithGoogle() {
    return this.socialAuth.signInWithGoogle();
  }

  signInWithFacebook() {
    return this.socialAuth.signInWithFacebook();
  }

  // OTP methods
  sendOTP(email: string) {
    return this.otpAuth.sendOTP(email);
  }

  verifyOTP(email: string, token: string) {
    return this.otpAuth.verifyOTP(email, token);
  }

  // Wallet methods
  async createAndStoreWallet(userId: string) {
    // Create a new wallet
    const wallet = this.walletManager.createWallet();
    
    // Encrypt the private key
    const encryptedPrivateKey = this.walletManager.encryptSecretKey(wallet.secretKey, userId);
    
    // Store the encrypted key
    await this.keyStorage.storeEncryptedKey(userId, wallet.publicKey, JSON.stringify(encryptedPrivateKey));
    
    return { publicKey: wallet.publicKey };
  }

  async getWallet(userId: string) {
    const { data, error } = await this.keyStorage.getEncryptedKey(userId);
    
    if (error || !data) {
      throw new Error('Failed to retrieve wallet');
    }
    
    // Return just the public key for general use
    return { publicKey: data.public_key };
  }

  // For transaction signing, we need to decrypt the private key temporarily
  async signTransaction(userId: string, transaction: any) {
    const { data, error } = await this.keyStorage.getEncryptedKey(userId);
    
    if (error || !data) {
      throw new Error('Failed to retrieve wallet');
    }
    
    // Decrypt the private key
    const secretKey = this.walletManager.decryptSecretKey(
      data.encrypted_private_key, 
      userId
    );
    
    // Use the Stellar SDK to sign the transaction
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    transaction.sign(keypair);
    
    return transaction;
  }
}

// Export individual components for advanced usage
export {
  SocialAuthProvider,
  OTPAuthProvider,
  StellarWalletManager,
  KeyStorageService,
  EncryptionService
};