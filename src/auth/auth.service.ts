import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../databases/supabase.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data?.session?.access_token || !data?.user?.id) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { data: user, error: userError } = await this.supabaseService
      .getClient()
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .single();

    if (userError || !user || !['owner', 'admin'].includes(user.role)) {
      throw new UnauthorizedException('Invalid user');
    }

    const payload: AuthPayload = {
      sub: user.id,
      email: user.email as string,
      role: user.role as string,
    };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async verifyAdmin(userId: string): Promise<boolean> {
    const { data: user, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return false;
    }

    return ['owner', 'admin'].includes(user.role as string);
  }
}
