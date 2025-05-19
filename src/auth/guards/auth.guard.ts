// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('인증 토큰이 없습니다.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('유효하지 않은 토큰 형식입니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      req.user = payload;
      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
