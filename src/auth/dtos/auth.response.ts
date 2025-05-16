import { ObjectType, Field } from '@nestjs/graphql';
import { AuthUser } from '../entities/auth.entity'; // AuthUser 엔티티 (선택 사항)

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => AuthUser, { nullable: true }) // 사용자 정보 필드 추가 (선택 사항)
  user?: AuthUser;
}
