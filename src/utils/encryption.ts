// encryption.ts
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private secretKey: Buffer;

  constructor(masterKey: string) {
    // Use a master key from environment variables
    this.secretKey = crypto.scryptSync(masterKey, 'salt', 32);
  }

  encrypt(text: string, userId: string) {
    // Create a unique IV for each encryption
    const iv = crypto.randomBytes(16);
    
    // Use user ID as additional authenticated data
    const aad = Buffer.from(userId);
    
    const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv) as crypto.CipherGCM;
    
    cipher.setAAD(aad);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedObject: any, userId: string) {
    const iv = Buffer.from(encryptedObject.iv, 'hex');
    const encryptedText = encryptedObject.encryptedData;
    const authTag = Buffer.from(encryptedObject.authTag, 'hex');
    const aad = Buffer.from(userId);
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv) as crypto.DecipherGCM;
    
    decipher.setAuthTag(authTag);
    decipher.setAAD(aad);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}