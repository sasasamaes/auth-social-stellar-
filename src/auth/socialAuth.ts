// socialAuth.ts
import { createClient } from '@supabase/supabase-js';

export class SocialAuthProvider {
  private supabase;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    return { data, error };
  }

  async signInWithFacebook() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'facebook',
    });
    return { data, error };
  }
}