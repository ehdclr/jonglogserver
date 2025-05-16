import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './databases/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // 스키마 자동 생성
      sortSchema: true,
      playground: true, // GraphQL Playground 활성화 (개발 환경)
      debug: true,
    }),
    UsersModule,
    AuthModule,
    // 다른 모듈들...
  ],
  providers: [],
})
export class AppModule {}
