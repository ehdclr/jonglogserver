import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private supabaseClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') as string;
    this.supabaseAnonKey = this.configService.get<string>(
      'SUPABASE_ANON_KEY',
    ) as string;
    this.supabaseClient = createClient(this.supabaseUrl, this.supabaseAnonKey);
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async verifyAdmin(userId: string): Promise<boolean> {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  }
}
