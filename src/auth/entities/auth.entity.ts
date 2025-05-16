// src/auth/entities/auth.entity.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  sub: string;

  @Field()
  email: string;

  @Field()
  role: string;
}
