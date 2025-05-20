import { Module } from '@nestjs/common';
import { DatabaseModule } from '../databases/database.module';
import { UserService } from './user.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [DatabaseModule, MailModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
