import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../databases/supabase.service';
import { User } from '../users/entities/user.entity';
import { AdminCreateUserInput } from './dto/admin.input';
import { PrismaService } from '../databases/prisma.service';
import { BlogSettings } from './entity/blog.entity';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.initializeBlogSettings();
  }

  private async initializeBlogSettings() {
    const settings = await this.prisma.blogSettings.findUnique({
      where: { id: 'main_settings' },
    });
    if (!settings) {
      await this.prisma.blogSettings.create({
        data: {
          id: 'main_settings',
          blogName: 'JONG, DEV',
          blogDescription: 'JONG, DEV 블로그',
          isGithubPublic: false,
          isEmailPublic: false,
          isSnsPublic: false,
          logoUrl: '',
          contactEmail: '',
          githubUrl: '',
          snsUrl: '',
        },
      });
      console.log('블로그 설정이 초기화되었습니다.');
    }
  }

  async adminCreateUser(
    adminCreateUserInput: AdminCreateUserInput,
    currentUser: User,
  ): Promise<void> {
    const admin = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });

    if (!admin) {
      throw new Error('존재하지 않는 사용자입니다.(관리자 확인)');
    }

    if (admin.role !== 'owner') {
      throw new Error('사용자 추가는 블로그 주인만 가능합니다.');
    }

    const { email, password, name } = adminCreateUserInput;
    const { data, error } = await this.supabaseService.createUserInSupabaseAuth(
      email,
      password,
    );
    if (error) {
      throw new Error(error.message);
    }

    await this.prisma.user.create({
      data: {
        email,
        name,
        role: 'admin',
      },
    });
  }

  async getBlogSettings(): Promise<BlogSettings> {
    const mainBlogSettings = await this.prisma.blogSettings.findUnique({
      where: { id: 'main_settings' },
    });

    if (!mainBlogSettings) {
      throw new Error('블로그 설정이 존재하지 않습니다.');
    }

    return mainBlogSettings;
  }
}
