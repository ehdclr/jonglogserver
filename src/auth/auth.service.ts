import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { LoginInput } from './dtos/login.input';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { RedisService } from '../databases/redis.service';
import { AuthUser } from './entities/auth.entity';
@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    // Supabase 클라이언트 초기화
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }
    // Supabase 인증으로 사용자 로그인
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
    return user;
  }

  async getCurrentUser(userPayload: any) {
    // 데이터베이스에서 최신 사용자 정보 조회
    const user = await this.usersService.findOne(userPayload.id);
    return user;
  }

  async login(loginInput: LoginInput) {
    const { email, password } = loginInput;
    const user = await this.validateUser(email, password);
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '3h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    await this.redisService.set(
      `refresh_token:${user.id}`,
      refreshToken,
      60 * 60 * 24 * 7, // 7일
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async logout(userPayload: any) {
    await this.redisService.del(`refresh_token:${userPayload.id}`);

    return {
      success: true,
      message: '로그아웃 성공',
    };
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);

    const storedToken = await this.redisService.get(
      `refresh_token:${payload.id}`,
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const user = await this.usersService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    const newPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: '3h',
    });
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

    await this.redisService.set(
      `refresh_token:${user.id}`,
      newRefreshToken,
      60 * 60 * 24 * 7, // 7일
    );

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
