import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../databases/prisma.service';
import { User } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany();

      return users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar_url: user.avatarUrl || undefined,
        bio: user.bio || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar_url: user.avatarUrl || undefined,
        bio: user.bio || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        avatar_url: user.avatarUrl || undefined,
        bio: user.bio || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async requestSignUp(email: string, name: string): Promise<void> {
    try {
      const exists = await this.prisma.user.findUnique({
        where: { email },
      });

      if (exists) {
        throw new BadRequestException('이미 가입된 이메일입니다.');
      }

      await this.prisma.signUpRequest.create({
        data: { email, name, status: 'pending' },
      });
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to request sign up');
    }
  }

  async processSignUpRequest(
    currentUser: User,
    requestId: string,
    status: string,
  ): Promise<void> {
    try {
      if (currentUser.role !== 'owner') {
        throw new BadRequestException(
          '소유자만 가입요청을 처리할 수 있습니다.',
        );
      }

      const signUpRequest = await this.prisma.signUpRequest.findUnique({
        where: { id: requestId },
      });

      if (!signUpRequest) {
        throw new NotFoundException('가입 요청이 존재하지 않습니다.');
      }

      if (signUpRequest.status !== 'pending') {
        throw new BadRequestException('이미 처리된 가입 요청입니다.');
      }

      if (status === 'accepted') {
        await this.prisma.signUpRequest.update({
          where: { id: requestId },
          data: { status: 'accepted' },
        });

        await this.mailService.sendMail({
          to: signUpRequest.email,
          subject: '[블로그] 회원가입 승인',
          html: `
        <div>
          <h1>회원가입 승인</h1>
          <p>회원가입 요청이 승인되었습니다.</p>
          <p>회원가입이 승인되었습니다!</p>
          <p><a href="${process.env.CLIENT_URL}/auth/complete-signup?signupRequestId=${requestId}">여기</a>를 클릭해 추가 정보를 입력해 가입을 완료하세요.</p>
        </div>
        `,
        });
      } else {
        await this.prisma.signUpRequest.update({
          where: { id: requestId },
          data: { status: 'rejected' },
        });

        await this.mailService.sendMail({
          to: signUpRequest.email,
          subject: '[블로그] 회원가입 거절',
          html: `
          <div>
            <h1>회원가입 거절</h1>
            <p>죄송합니다. 회원가입 요청이 거절되었습니다.</p>
          </div>
          `,
        });
      }
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async create(user: User, signupRequestId: string): Promise<void> {
    try {
      const signUpRequest = await this.prisma.signUpRequest.findUnique({
        where: { id: signupRequestId, status: 'accepted' },
      });

      if (!signUpRequest) {
        throw new NotFoundException('가입 요청이 존재하지 않습니다.');
      }

      await this.prisma.user.create({
        data: { ...user, name: user.name ?? '' },
      });
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(currentUser: User, updateUser: User): Promise<User> {
    try {
      if (currentUser.role == 'admin' && updateUser.id !== currentUser.id) {
        throw new BadRequestException(
          '소유자 외의 사용자는 자신이외의 사용자를 수정할 수 없습니다.',
        );
      }

      const result = await this.prisma.user.update({
        where: { id: updateUser.id },
        data: {
          ...updateUser,
          name: updateUser.name ?? '',
          bio: updateUser.bio ?? undefined,
          avatarUrl: updateUser.avatar_url ?? undefined,
        },
      });
      return {
        ...result,
        name: result.name ?? undefined,
        bio: result.bio ?? undefined,
        avatar_url: result.avatarUrl ?? undefined,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(currentUser: User, id: string): Promise<User> {
    try {
      if (currentUser.role == 'admin' && id !== currentUser.id) {
        throw new BadRequestException(
          '소유자 외의 사용자는 자신이외의 사용자를 삭제할 수 없습니다.',
        );
      }
      const result = await this.prisma.user.delete({
        where: { id },
      });
      return {
        ...result,
        name: result.name ?? undefined,
        bio: result.bio ?? undefined,
        avatar_url: result.avatarUrl ?? undefined,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
