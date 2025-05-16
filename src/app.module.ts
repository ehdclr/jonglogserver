// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PostsModule } from './modules/posts/posts.module';
import { AuthModule } from './modules/auth/auth.module';
import { supabaseConfig } from './config/supabase.config';
import { supabaseProvider, supabaseAdminProvider } from './commons/lib/supabase.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig],
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    PostsModule,
    AuthModule,
  ],
  providers: [supabaseProvider, supabaseAdminProvider],
})
export class AppModule {}
