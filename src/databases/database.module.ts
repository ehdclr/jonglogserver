import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
@Module({
  imports: [ConfigModule], // ConfigModule을 forRoot()와 함께 import
  providers: [
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        return new PrismaService(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: SupabaseService,
      useFactory: (configService: ConfigService) => {
        return new SupabaseService(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: RedisService,
      useFactory: (configService: ConfigService) => {
        return new RedisService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [SupabaseService, PrismaService, RedisService],
})
export class DatabaseModule {}
