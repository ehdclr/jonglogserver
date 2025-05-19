// src/auth/entities/auth.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bio?: string;
}
