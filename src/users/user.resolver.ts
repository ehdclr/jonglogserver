import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { Args, Query, Resolver, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateUserInput } from './dtos/create-user.input';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  RequestSignUpResponse,
  SignUpRequestListResponse,
  ProcessSignUpRequestResponse,
  CheckSignUpRequestResponse,
} from './dtos/users.response';
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    try {
      return this.userService.findOne(id);
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  @Mutation(() => RequestSignUpResponse)
  async requestSignUp(
    @Args('email') email: string,
    @Args('name') name: string,
  ): Promise<RequestSignUpResponse> {
    try {
      const result = await this.userService.requestSignUp(email, name);
      return {
        status: result.data?.status ?? '',
        canResend: result.data?.canResend ?? false,
        expiresAt: result.data?.expiresAt ?? undefined,
        success: true,
        message: result.data?.message ?? '가입 요청이 처리되었습니다.',
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => ProcessSignUpRequestResponse)
  @UseGuards(AuthGuard)
  async processSignUpRequest(
    @Args('requestId') requestId: string,
    @Args('status') status: string,
    @Context() context,
  ): Promise<ProcessSignUpRequestResponse> {
    try {
      await this.userService.processSignUpRequest(
        context.req.user,
        requestId,
        status,
      );
      return {
        success: true,
        message: '가입 요청이 처리되었습니다.',
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Query(() => SignUpRequestListResponse)
  @UseGuards(AuthGuard)
  async signUpRequests(@Context() context): Promise<SignUpRequestListResponse> {
    try {
      const result = await this.userService.getSignUpRequests(context.req.user);
      return {
        signUpRequests: result,
        success: true,
        message: '가입 요청 목록을 조회했습니다.',
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Query(() => CheckSignUpRequestResponse)
  async checkSignUpRequest(
    @Args('requestId') requestId: string,
  ): Promise<CheckSignUpRequestResponse> {
    try {
      console.log('requestId', requestId);
      const result = await this.userService.checkSignUpRequest(requestId);
      return {
        success: true,
        message: '가입 요청 상태를 조회했습니다.',
        signUpRequest: result,
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //TODO 사용자 생성
  @Mutation(() => User)
  async createUser(
    @Args('user') user: CreateUserInput,
    @Args('signupRequestId') signupRequestId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.userService.create(user, signupRequestId);
      return {
        success: true,
        message: '사용자가 생성되었습니다.',
      };
    } catch (error) {
      console.log('error', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //TODO 관리자가 사용자 수정 가능해야함 혹은 본인이 수정가능
  // @Mutation(() => User)
  // @UseGuards(AuthGuard)
  // async updateUser(
  //   @Args('user') user: ,
  //   @Context() context,
  // ): Promise<User> {
  //   const result = await this.userService.update(context.user, user);
  //   return result;
  // }

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
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
}
