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
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    PassportModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  providers: [
    {
      provide: AuthService,
      useFactory: (
        jwtService: JwtService,
        usersService: UserService,
        configService: ConfigService,
        redisService: RedisService,
      ) => {
        return new AuthService(
          jwtService,
          usersService,
          configService,
          redisService,
        );
      },
      inject: [JwtService, UserService, ConfigService, RedisService],
    },
    AuthResolver,
    JwtStrategy,
    RedisService,
    ConfigService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
