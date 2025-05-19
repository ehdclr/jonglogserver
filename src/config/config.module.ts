import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('8080'),

  //Supabase`
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  //Database
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string(),

  //Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string(),
  REDIS_DB: z.string().default('0'),
});

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config: Record<string, unknown>) => {
        try {
          return envSchema.parse(config);
        } catch (error) {
          console.error('Invalid configuration:', error);
          throw error;
        }
      },
    }),
  ],
})
export class ConfigModule {}
