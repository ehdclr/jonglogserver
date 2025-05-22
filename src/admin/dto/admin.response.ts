import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminCreateUserResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}
