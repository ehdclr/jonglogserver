import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from './prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()], // ConfigModule을 forRoot()와 함께 import
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
  ],
  exports: [SupabaseService, PrismaService],
})
export class DatabaseModule {}
