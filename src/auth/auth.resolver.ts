import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dtos/login.input';
import { AuthPayload } from './dtos/auth.response';
import { SupabaseService } from '../databases/supabase.service';
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
  async getCurrentUser(@Args('accessToken') accessToken: string) {
    return this.authService.getCurrentUser(accessToken);
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('loginInput', { type: () => LoginInput }) loginInput: LoginInput,
    @Context() context,
  ) {
    const { user, accessToken, refreshToken } = await this.authService.login(
      loginInput,
    );

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
  }

  @Mutation(() => AuthPayload)
  async refreshToken(@Args('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
