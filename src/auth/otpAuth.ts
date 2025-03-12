// otpAuth.ts
import { createClient } from '@supabase/supabase-js';

export class OTPAuthProvider {
  private supabase;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async sendOTP(email: string) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
    });
    return { data, error };
  }

  async verifyOTP(email: string, token: string) {
    const { data, error } = await this.supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { data, error };
  }
}