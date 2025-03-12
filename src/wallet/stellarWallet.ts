// stellarWallet.ts
import StellarSdk from 'stellar-sdk';
import { EncryptionService } from '../utils/encryption';

export class StellarWalletManager {
  private encryptionService: EncryptionService;
  
  constructor(encryptionService: EncryptionService) {
    this.encryptionService = encryptionService;
  }

  createWallet() {
    // Generate a new keypair
    const keypair = StellarSdk.Keypair.random();
    
    // Get the public key (address)
    const publicKey = keypair.publicKey();
    
    // Get the secret key
    const secretKey = keypair.secret();
    
    return {
      publicKey,
      secretKey,
    };
  }

  // Create an encrypted version of the secret key for storage
  encryptSecretKey(secretKey: string, userId: string) {
    return this.encryptionService.encrypt(secretKey, userId);
  }

  // Decrypt the secret key when needed for transactions
  decryptSecretKey(encryptedKey: string, userId: string) {
    return this.encryptionService.decrypt(encryptedKey, userId);
  }
}