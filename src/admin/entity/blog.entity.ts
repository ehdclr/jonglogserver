import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BlogSettings {
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

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
