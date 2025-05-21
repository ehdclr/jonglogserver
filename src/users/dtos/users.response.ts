import { Field, ObjectType } from '@nestjs/graphql';
import { SignUpRequest } from '../entities/user.entity';

@ObjectType()
export class RequestSignUpResponse {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Boolean, { nullable: true })
  canResend?: boolean;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class SignUpRequestListResponse {
  @Field(() => [SignUpRequest], { nullable: true })
  signUpRequests?: SignUpRequest[];

  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class ProcessSignUpRequestResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class CheckSignUpRequestResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;

  @Field(() => SignUpRequest, { nullable: true })
  signUpRequest?: SignUpRequest;
}
