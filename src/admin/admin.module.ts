import { Module } from '@nestjs/common';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { UserModule } from '../users/user.module';
import { SupabaseService } from '../databases/supabase.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [UserModule, SupabaseService, ConfigModule],
  providers: [AdminResolver, AdminService],
  exports: [AdminService],
})
export class AdminModule {}
