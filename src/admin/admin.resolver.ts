import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import {
  AdminCreateUserInput,
  UpdateBlogSettingsInput,
} from './dto/admin.input';
import { AdminCreateUserResponse } from './dto/admin.response';
import {
  blogSettingResponse,
  blogSettingUpdateResponse,
} from './dto/admin.response';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  // //TODO 블로그 설정 조회
  @Query(() => blogSettingResponse)
  async getBlogSettings(): Promise<blogSettingResponse> {
    try {
      const blogSettings = await this.adminService.getBlogSettings();
      return {
        success: true,
        message: '블로그 설정 조회 성공',
        blogSettings,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => blogSettingUpdateResponse)
  @UseGuards(AuthGuard)
  async updateBlogSettings(
    @Args('updateBlogSettingsInput')
    updateBlogSettingsInput: UpdateBlogSettingsInput,
    @Context() context,
  ): Promise<blogSettingUpdateResponse> {
    try {
      await this.adminService.updateBlogSettings(
        updateBlogSettingsInput,
        context.req.user,
      );
      return {
        success: true,
        message: '블로그 설정 업데이트 성공',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // //TODO owner 사용자 추가 --임의의 비밀번호 사용
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
