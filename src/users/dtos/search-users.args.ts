import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SearchUsersArgs {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  role?: string;
}
