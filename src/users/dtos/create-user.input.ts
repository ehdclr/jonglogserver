import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  @Field()
  name?: string;

  @Field({ defaultValue: 'admin' })
  role: string; //기본값 admin

  @Field()
  avatar_url?: string;

  @Field()
  bio?: string;
}
