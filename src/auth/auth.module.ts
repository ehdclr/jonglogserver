import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../databases/database.module';
import { UserModule } from '../users/user.module';
import { RedisService } from '../databases/redis.service';
import { AuthGuard } from './guards/auth.guard'; // 반드시 import
import { forwardRef } from '@nestjs/common';
@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    RedisService,
    AuthGuard, // 반드시 providers에 등록
  ],
  exports: [
    AuthService,
    JwtModule,
    AuthGuard, // 반드시 providers에 등록된 것만 exports 가능
  ],
})
export class AuthModule {}