import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../databases/prisma.service';
import { User, SignUpRequest } from './entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateUserInput } from './dtos/create-user.input';
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
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`존재하지 않는 사용자입니다.`);
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
  }

  async requestSignUp(
    email: string,
    name: string,
  ): Promise<{
    data?: {
      status: string;
      message: string;
      canResend: boolean;
      expiresAt: Date;
    };
    success: boolean;
    message: string;
  }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const existingRequest = await this.prisma.signUpRequest.findFirst({
      where: {
        email,
        status: { in: ['pending', 'accepted'] },
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    // 만료되지 않은 경우에만 상태 체크
    if (existingRequest) {
      switch (existingRequest.status) {
        case 'pending':
          return {
            data: {
              status: 'pending',
              message: '가입 요청이 처리 대기 중입니다.',
              canResend: false,
              expiresAt: existingRequest.expiresAt,
            },
            success: true,
            message: '가입 요청이 전송되었습니다.',
          };
        case 'accepted':
          return {
            data: {
              status: 'accepted',
              message: `가입 요청이 승인되었습니다. 회원가입을 완료해주세요. 
                  ${process.env.CLIENT_URL}/auth/complete-signup?signupRequestId=${existingRequest.id}에서 완료해주세요.`,
              canResend: false,
              expiresAt: existingRequest.expiresAt,
            },
            success: true,
            message: '가입 요청이 전송되었습니다.',
          };
      }
    }

    // 4. 가입 요청 이메일 발송
    const result = await this.mailService.sendMail({
      to: email,
      subject: '[블로그] 가입 요청 접수',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; overflow: hidden;">
            <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">블로그 가입 요청</h1>
            </div>
            
            <div style="padding: 30px; color: #333333;">
              <h2 style="margin-top: 0; margin-bottom: 20px; color: #1e3a8a; font-size: 20px;">가입 요청이 접수되었습니다</h2>
              
              <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">안녕하세요, 블로그 가입에 관심을 가져주셔서 감사합니다.</p>
              
              <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">귀하의 가입 요청이 성공적으로 접수되었습니다. 관리자 검토 후 승인 여부를 이메일로 안내해 드리겠습니다.</p>
              

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 15px;">
                  <strong>참고사항:</strong> 가입 요청은 24시간 동안 유효합니다.
                </p>
              </div>
              

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 600; font-size: 16px;">블로그 방문하기</a>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">
                © 이현종 블로그. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (!result) {
      throw new BadRequestException(
        '이메일 전송에 실패했습니다. 잠시후 다시 시도해주세요.',
      );
    }

    // 3. 새로운 가입 요청 생성
    await this.prisma.signUpRequest.create({
      data: {
        email,
        name,
        status: 'pending',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24시간
      },
    });

    return {
      success: true,
      message: '가입 요청이 전송되었습니다.',
    };
  }

  //! owner만 가능
  async processSignUpRequest(
    currentUser: User,
    requestId: string,
    status: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (user?.role !== 'owner') {
      throw new BadRequestException('소유자만 가입요청을 처리할 수 있습니다.');
    }

    const signUpRequest = await this.prisma.signUpRequest.findUnique({
      where: { id: requestId },
    });

    if (!signUpRequest) {
      throw new NotFoundException('가입 요청이 존재하지 않습니다.');
    }

    if (
      signUpRequest.status !== 'pending' &&
      signUpRequest.status !== 'expired'
    ) {
      throw new BadRequestException('이미 처리된 가입 요청입니다.');
    }

    if (
      signUpRequest.expiresAt < new Date() ||
      signUpRequest.status === 'expired'
    ) {
      throw new BadRequestException(
        '만료된 가입요청입니다. 다시 요청해주세요.',
      );
    }

    if (status.toLowerCase() === 'accepted') {
      const result = await this.mailService.sendMail({
        to: signUpRequest.email,
        subject: '[블로그] 회원가입 승인',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; overflow: hidden;">
    <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">블로그 가입 승인</h1>
    </div>
    
    <div style="padding: 30px; color: #333333;">
      <h2 style="margin-top: 0; margin-bottom: 20px; color: #1e3a8a; font-size: 20px;">가입 요청이 승인되었습니다!</h2>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">안녕하세요, 블로그 가입 요청이 <strong>승인</strong>되었습니다.</p>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">저희 블로그 커뮤니티의 일원이 되신 것을 진심으로 환영합니다. 이제 아래 버튼을 클릭하여 추가 정보를 입력하고 가입 절차를 완료해 주세요.</p>
      
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af; font-size: 15px;">
          <strong>중요:</strong> 가입 완료 링크는 보안을 위해 24시간 동안만 유효합니다.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/auth/complete-signup?signupRequestId=${requestId}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 600; font-size: 16px;">가입 완료하기</a>
      </div>
      
      <p style="margin-top: 25px; margin-bottom: 15px; line-height: 1.6; font-size: 16px;">버튼이 작동하지 않는 경우, 아래 링크를 복사하여 브라우저에 붙여넣기 해주세요:</p>
      
      <div style="background-color: #f8fafc; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #64748b; margin-bottom: 20px;">
        ${process.env.CLIENT_URL}/auth/complete-signup?signupRequestId=${requestId}
      </div>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">블로그에서 할 수 있는 일:</p>
      <ul style="color: #333333; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
        <li>다양한 주제의 글 작성 및 공유</li>
        <li>다른 회원들과 소통 및 네트워킹</li>
        <li>관심 있는 콘텐츠 구독</li>
        <li>개인 프로필 관리</li>
      </ul>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
        © 이현종 블로그. All rights reserved.
      </p>
      <p style="margin: 0; color: #64748b; font-size: 14px;">
        이 이메일은 회원님의 가입 요청에 따라 발송되었습니다.
      </p>
    </div>
  </div>
</body>
</html>
        `,
      });

      if (!result) {
        throw new BadRequestException(
          '이메일 전송에 실패했습니다. 잠시후 다시 시도해주세요.',
        );
      }

      await this.prisma.signUpRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      });
    } else {
      const result = await this.mailService.sendMail({
        to: signUpRequest.email,
        subject: '[블로그] 회원가입 거절',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; overflow: hidden;">
    <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">블로그 가입 결과 안내</h1>
    </div>
    
    <div style="padding: 30px; color: #333333;">
      <h2 style="margin-top: 0; margin-bottom: 20px; color: #1e3a8a; font-size: 20px;">가입 요청 결과 안내</h2>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">안녕하세요, 블로그 가입에 관심을 가져주셔서 감사합니다.</p>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">회원님의 블로그 가입 요청을 신중하게 검토했습니다. 아쉽게도 현재 회원님의 가입 요청을 승인해 드리기 어려운 상황임을 알려드립니다.</p>
      
      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1e40af; font-size: 15px;">
          <strong>참고사항:</strong> 가입이 거절된 이유는 다음과 같은 경우일 수 있습니다. 아니라면 걍 꺼지쇼:
        </p>
        <ul style="margin: 10px 0 0; padding-left: 20px; color: #1e40af; font-size: 15px;">
          <li>제공된 정보가 불충분하거나 정확하지 않은 경우</li>
          <li>블로그의 주제 또는 목적과 맞지 않는 경우</li>
          <li>기타 내부 정책에 따른 결정</li>
        </ul>
      </div>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">추가 문의사항이 있으시면 언제든지 아래 버튼을 클릭하여 문의해 주시기 바랍니다.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 600; font-size: 16px;">문의하기</a>
      </div>
      
      <p style="margin-bottom: 15px; line-height: 1.6; font-size: 16px;">앞으로도 저희 블로그에 관심을 가져주시기 바랍니다. 감사합니다.</p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
        © 이현종 블로그. All rights reserved.
      </p>
      <p style="margin: 0; color: #64748b; font-size: 14px;">
        이 이메일은 회원님의 가입 요청에 따라 발송되었습니다.
      </p>
    </div>
  </div>
</body>
</html>
          `,
      });

      if (!result) {
        throw new BadRequestException(
          '이메일 전송에 실패했습니다. 잠시후 다시 시도해주세요.',
        );
      }

      await this.prisma.signUpRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });
    }
  }

  async getSignUpRequests(currentUser: User): Promise<SignUpRequest[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.role !== 'owner') {
      throw new BadRequestException(
        '소유자만 가입 요청 목록을 조회할 수 있습니다.',
      );
    }
    const allRequests = await this.prisma.signUpRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const uniqueByEmail = Object.values(
      allRequests.reduce(
        (acc, cur) => {
          if (!acc[cur.email]) acc[cur.email] = cur;
          return acc;
        },
        {} as Record<string, (typeof allRequests)[0]>,
      ),
    );
    return uniqueByEmail.map((signUpRequest) => ({
      id: signUpRequest.id,
      email: signUpRequest.email,
      name: signUpRequest.name,
      status: signUpRequest.status,
      expiresAt: signUpRequest.expiresAt,
      createdAt: signUpRequest.createdAt,
      updatedAt: signUpRequest.updatedAt,
    }));
  }

  async checkSignUpRequest(requestId: string): Promise<SignUpRequest> {
    const signUpRequest = await this.prisma.signUpRequest.findUnique({
      where: { id: requestId },
    });

    if (!signUpRequest) {
      throw new NotFoundException('가입 요청이 존재하지 않습니다.');
    }
    return signUpRequest;
  }

  async create(user: CreateUserInput, signupRequestId: string): Promise<void> {
    const signUpRequest = await this.prisma.signUpRequest.findUnique({
      where: { id: signupRequestId, status: 'accepted' },
    });

    if (!signUpRequest) {
      throw new NotFoundException('가입 요청이 존재하지 않습니다.');
    }

    await this.prisma.user.create({
      data: { ...user, name: user.name ?? '' },
    });
  }

  async update(currentUser: User, updateUser: User): Promise<User> {
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
  }

  async delete(currentUser: User, id: string): Promise<User> {
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
  }

  //! CRON JOB
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSignUpRequests() {
    try {
      const signUpRequests = await this.prisma.signUpRequest.findMany({
        where: {
          expiresAt: { lt: new Date() },
          status: { in: ['pending', 'accepted', 'rejected'] },
        },
      });

      for (const signUpRequest of signUpRequests) {
        await this.prisma.signUpRequest.update({
          where: { id: signUpRequest.id },
          data: { status: 'expired' },
        });
      }
    } catch (error) {
      console.error('error in handleExpiredSignUpRequests:', error);
    }
  }
}
