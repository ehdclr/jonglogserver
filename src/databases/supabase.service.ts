import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Failed to login in Supabase Auth: ${error.message}`);
      }
      return data;
    } catch (error) {
      throw new Error(`Failed to login in Supabase Auth: ${error.message}`);
    }
  }

  // Supabase Auth에 사용자 생성
  async createUserInSupabaseAuth(
    email: string,
    password: string,
  ): Promise<{ data: { user: any }; error: any }> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new Error(
        `Failed to create user in Supabase Auth: ${error.message}`,
      );
    }

    return {
      data,
      error,
    };
  }

  async updateUserInSupabaseAuth(
    userId: string,
    userData: { email?: string; password?: string },
  ): Promise<{ data: { user: any }; error: any }> {
    const { data, error } = await this.supabase.auth.admin.updateUserById(
      userId,
      userData,
    );

    if (error) {
      throw new Error(
        `Failed to update user in Supabase Auth: ${error.message}`,
      );
    }

    return {
      data,
      error,
    };
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    try {
      const { data: session, error } = await this.supabase.auth.getSession();

      if (error || !session?.session) {
        return false;
      }

      // Verify that the token belongs to the user
      return session.session.user.id === userId;
    } catch (error) {
      return false;
    }
  }

  // Supabase Auth에서 사용자 삭제
  async deleteUserFromSupabaseAuth(id: string) {
    const { error } = await this.supabase.auth.admin.deleteUser(id);

    if (error) {
      throw new Error(
        `Failed to delete user from Supabase Auth: ${error.message}`,
      );
    }

    return true;
  }

  async verifyUser(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    return !error && data.user !== null;
  }
}
