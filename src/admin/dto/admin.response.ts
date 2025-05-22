import { Field, ObjectType } from '@nestjs/graphql';
import { BlogSettings } from '../entity/blog.entity';
@ObjectType()
export class AdminCreateUserResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class blogSettingResponse {
  @Field(() => BlogSettings, { nullable: true })
  blogSettings?: BlogSettings;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class blogSettingUpdateResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}
