import { Module } from '@nestjs/common';
import { AdminResolver } from './admin.resolver';
import { AdminService } from './admin.service';
import { UserModule } from '../users/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../databases/database.module';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';
@Module({
  imports: [
    UserModule,
    ConfigModule,
    DatabaseModule,
    forwardRef(() => AuthModule),
  ],
  providers: [AdminResolver, AdminService],
  exports: [AdminService],
})
export class AdminModule {}
