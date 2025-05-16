import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dtos/login.input';
import { AuthPayload } from './dtos/auth.response';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(
    @Args('loginInput', { type: () => LoginInput }) loginInput: LoginInput,
  ) {
    return this.authService.login(loginInput.email, loginInput.password);
  }
}
