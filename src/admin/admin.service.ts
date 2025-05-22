import { Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { SupabaseService } from '../databases/supabase.service';
import { User } from '../users/entities/user.entity';
import { AdminCreateUserInput } from './dto/admin.input';
import { PrismaService } from '../databases/prisma.service';
@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

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
}
