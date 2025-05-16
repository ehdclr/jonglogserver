import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const supabaseProvider: FactoryProvider = {
  provide: 'SupabaseClient',
  useFactory: (configService: ConfigService) => {
    const supabaseUrl = configService.get<string>('supabase.url') as string;
    const supabaseAnonKey = configService.get<string>(
      'supabase.anonKey',
    ) as string;
    return createClient(supabaseUrl, supabaseAnonKey);
  },
  inject: [ConfigService],
};

// 서버 컴포넌트 (Guard, Service 등)에서 Admin API를 사용해야 하는 경우 사용할 클라이언트
export const supabaseAdminProvider: FactoryProvider = {
  provide: 'SupabaseAdminClient',
  useFactory: (configService: ConfigService) => {
    const supabaseUrl = configService.get<string>('supabase.url') as string;
    const supabaseServiceKey = configService.get<string>(
      'supabase.serviceKey',
    ) as string;
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  },
  inject: [ConfigService],
};
