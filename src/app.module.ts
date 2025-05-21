import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './databases/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // 스키마 자동 생성
      sortSchema: true,
      context: ({ req, res }) => ({ req, res }),
      playground: true, // GraphQL Playground 활성화 (개발 환경)
      debug: true,
    }),
    UserModule,
    AuthModule,
    MailModule,
    // 다른 모듈들...
  ],
  providers: [],
})
export class AppModule {}
