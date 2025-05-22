import { Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Args, Context, Mutation } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { AdminCreateUserInput } from './dto/admin.input';
import { AdminCreateUserResponse } from './dto/admin.response';
@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  //TODO owner 사용자 추가 --임의의 비밀번호 사용
  @Mutation(() => AdminCreateUserResponse)
  @UseGuards(AuthGuard)
  async adminCreateUser(
    @Args('adminCreateUserInput') adminCreateUserInput: AdminCreateUserInput,
    @Context() context,
  ): Promise<AdminCreateUserResponse> {
    try {
      await this.adminService.adminCreateUser(
        adminCreateUserInput,
        context.req.user,
      );
      return {
        success: true,
        message: '사용자가 생성되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
