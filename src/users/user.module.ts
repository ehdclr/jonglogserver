import { Module } from '@nestjs/common';
import { DatabaseModule } from '../databases/database.module';
import { UserService } from './user.service';
import { MailModule } from '../mail/mail.module';
import { UserResolver } from './user.resolver';
import { AuthModule } from '../auth/auth.module';
import { forwardRef } from '@nestjs/common';
@Module({
  imports: [DatabaseModule, MailModule, forwardRef(() => AuthModule)],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
