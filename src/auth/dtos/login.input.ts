import { Field, InputType } from '@nestjs/graphql'; // ArgsType 대신 InputType 임포트

@InputType() // @ArgsType() 대신 @InputType() 사용
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
