import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginArgs } from './dtos/login.input';
import { AuthPayload } from './dtos/auth-payload.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload, { name: 'login' })
  async loginAdmin(@Args() loginAdminArgs: LoginArgs): Promise<AuthPayload> {
    const { accessToken } = await this.authService.login(
      loginAdminArgs.email,
      loginAdminArgs.password,
    );
    return { accessToken };
  }
}
