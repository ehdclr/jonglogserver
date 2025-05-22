// src/databases/redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis, { Redis as RedisType } from 'ioredis';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class RedisService {
  private readonly redis: RedisType;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
  }

  async set(key: string, value: string, ttl: number): Promise<void> {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
