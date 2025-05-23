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

@InputType()
export class UpdateBlogSettingsInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String)
  blogName: string;

  @Field(() => String, { nullable: true })
  blogDescription?: string | null;

  @Field(() => String, { nullable: true })
  logoUrl?: string | null;

  @Field(() => String, { nullable: true })
  githubUrl?: string | null;

  @Field(() => Boolean, { defaultValue: false })
  isGithubPublic: boolean;

  @Field(() => String, { nullable: true })
  contactEmail?: string | null;

  @Field(() => Boolean, { defaultValue: false })
  isEmailPublic: boolean;

  @Field(() => String, { nullable: true })
  snsUrl?: string | null;

  @Field(() => Boolean, { defaultValue: false })
  isSnsPublic: boolean;
}
