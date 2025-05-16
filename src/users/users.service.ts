import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../databases/supabase.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dtos/create-user.input';
import { SearchUsersArgs } from './dtos/search-users.args';
@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(createUserInput: CreateUserInput): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .rpc('create_user', {
        user_email: createUserInput.email,
        user_password: createUserInput.password,
        user_name: createUserInput.name,
      })
      .single();

    if (error || !data) {
      console.error('Error creating admin user:', error);
      throw new Error('Failed to create admin user');
    }

    return data as string;
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }

    return data as User[];
  }

  async findOne(id: string): Promise<User | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      return null;
    }

    return data as User | null;
  }

  async searchUsers(searchArgs: SearchUsersArgs): Promise<User[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('email', searchArgs.email)
      .eq('name', searchArgs.name)
      .eq('role', searchArgs.role);

    if (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }

    return data as User[];
  }
}
