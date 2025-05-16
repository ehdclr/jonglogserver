import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dtos/create-user.input'; // 경로 확인
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // 필요에 따라
import { SearchUsersArgs } from './dtos/search-users.args';
import { User } from './entities/user.entity';
@Resolver()
@UseGuards(AuthGuard) // 기본적으로 관리자 권한 필요
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => String, { name: 'createUser' })
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() user: any, // AuthGuard를 통과한 사용자 정보 (선택 사항)
  ): Promise<string> {
    if (user?.role !== 'owner') {
      throw new UnauthorizedException('Only owners can create admin accounts.');
    }
    return this.usersService.createUser(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  async getUsers(@Args() searchArgs: SearchUsersArgs): Promise<User[]> {
    console.log('getUsers');
    return this.usersService.searchUsers(searchArgs);
  }

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<User | null> {
    return this.usersService.findOne(id);
  }
}
