import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { Args, Query, Resolver, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  async requestSignUp(
    @Args('email') email: string,
    @Args('name') name: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.userService.requestSignUp(email, name);
    return {
      success: true,
      message: '가입 요청이 전송되었습니다.',
    };
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async processSignUpRequest(
    @Args('requestId') requestId: string,
    @Args('status') status: string,
    @Context() context,
  ): Promise<{ success: boolean; message: string }> {
    await this.userService.processSignUpRequest(
      context.user, 
      requestId,
      status,
    );
    return {
      success: true,
      message: '가입 요청이 처리되었습니다.',
    };
  }

  //TODO 사용자 생성
  @Mutation(() => User)
  async createUser(
    @Args('user') user: User,
    @Args('signupRequestId') signupRequestId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.userService.create(user, signupRequestId);
      return {
        success: true,
        message: '사용자가 생성되었습니다.',
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }
  //TODO 관리자가 사용자 추가 삭제 수정 가능해야함
  // @Mutation(() => User)
  // @UseGuards(AuthGuard)
  // async createUser(
  //   @Args('user') user: User,
  //   @Context() context,
  // ): Promise<User> {
  //   const result = await this.userService.create(context.user, user);
  //   return result;
  // }

  //TODO 관리자가 사용자 수정 가능해야함 혹은 본인이 수정가능
  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateUser(
    @Args('user') user: User,
    @Context() context,
  ): Promise<User> {
    const result = await this.userService.update(context.user, user);
    return result;
  }

  //TODO 관리자가 사용자 삭제 가능해야함 혹은 본인이 삭제가능
  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async deleteUser(@Args('id') id: string, @Context() context): Promise<User> {
    const result = await this.userService.delete(context.user, id);
    return result;
  }

  //TODO 관리자가 사용자 목록 조회 가능해야함
  @Query(() => [User])
  @UseGuards(AuthGuard)
  async users(@Context() context): Promise<User[]> {
    try {
      if (context.user.role !== 'owner') {
        throw new BadRequestException(
          '소유자만 사용자 목록을 조회할 수 있습니다.',
        );
      }
      return this.userService.findAll();
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
}
