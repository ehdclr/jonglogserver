import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AdminCreateUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  name: string;
}
