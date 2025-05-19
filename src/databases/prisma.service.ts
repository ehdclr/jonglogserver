// src/databases/prisma.service.ts
import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // 트랜잭션 헬퍼 메서드
  async executeInTransaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma: PrismaClient) => {
      return callback(prisma);
    });
  }

  // 데이터베이스 클리닝 (테스트용)
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // 테이블 순서에 주의하여 삭제
    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => !name.includes('_prisma_migrations'))
      .map((name) => `"public"."${name}"`);

    try {
      await this.$executeRawUnsafe(
        `TRUNCATE TABLE ${tables.join(', ')} CASCADE;`,
      );
    } catch (error) {
      console.error('Error cleaning database:', error);
      throw error;
    }
  }
}
