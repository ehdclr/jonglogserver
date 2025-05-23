import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dtos/login.input';
import { AuthPayload } from './dtos/auth.response';
import { SupabaseService } from '../databases/supabase.service';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Query(() => String)
  hello() {
    return 'Hello World!';
  }

  @Query(() => AuthPayload)
  @UseGuards(AuthGuard)
  getCurrentUser(@Context() context) {
    try {
      const user = this.authService.getCurrentUser(context.req.user);
      return {
        user,
        success: true,
        message: '현재 접속 중인 사용자 정보',
      };
    } catch (error) {
      console.log('error', error);
      return {
        user: null,
        accessToken: null,
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('loginInput', { type: () => LoginInput }) loginInput: LoginInput,
    @Context() context,
  ) {
    try {
      const { user, accessToken, refreshToken } =
        await this.authService.login(loginInput);

      if (context.res) {
        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7일
        });
      }
      return {
        user,
        accessToken,
        success: true,
        message: '로그인 성공',
      };
    } catch (error) {
      console.log('error', error);
      return {
        user: null,
        accessToken: null,
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => AuthPayload)
  @UseGuards(AuthGuard)
  async logout(@Context() context) {
    try {
      await this.authService.logout(context.req.user);

      if (context.res) {
        context.res.clearCookie('refreshToken');
      }
      return {
        success: true,
        message: '로그아웃 성공',
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => AuthPayload)
  async refreshToken(@Context() context) {
    try {
      const refreshToken =
        context.req.cookies?.refreshToken ||
        context.req.headers['cookie']
          ?.split('; ')
          .find((c) => c.startsWith('refreshToken='))
          ?.split('=')[1];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = await this.authService.refreshToken(refreshToken);

      if (context.res) {
        context.res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7일
        });
      }

      return {
        user,
        accessToken: newAccessToken,
        success: true,
        message: '토큰 갱신 성공',
      };
    } catch (error) {
      console.log('error', error);
      return {
        user: null,
        accessToken: null,
        success: false,
        message: error.message,
      };
    }
  }
}
