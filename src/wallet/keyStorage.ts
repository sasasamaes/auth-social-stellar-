// keyStorage.ts
import { createClient } from '@supabase/supabase-js';

export class KeyStorageService {
  private supabase;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async storeEncryptedKey(userId: string, publicKey: string, encryptedPrivateKey: string) {
    const { data, error } = await this.supabase
      .from('wallet_keys')
      .insert([
        { 
          user_id: userId, 
          public_key: publicKey, 
          encrypted_private_key: encryptedPrivateKey 
        }
      ]);
    
    return { data, error };
  }

  async getEncryptedKey(userId: string) {
    const { data, error } = await this.supabase
      .from('wallet_keys')
      .select('encrypted_private_key, public_key')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  }
}