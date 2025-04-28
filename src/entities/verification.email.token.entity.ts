import { mapToPartialUserEntity, UserEntity } from './user.entity';
import { EmailVerificationToken, User } from '../../generated/prisma';

export class EmailVerificationTokenEntity {
  id?: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  User?: Partial<UserEntity> | null;

  constructor(params: {
    id?: number;
    userId: number;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    User?: Partial<UserEntity> | null;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.token = params.token;
    this.expiresAt = params.expiresAt;
    this.createdAt = params.createdAt;
    this.User = params.User;
  }
}

export function mapToEmailVerificationTokenEntity(param: {
  emailVerificationToken: EmailVerificationToken;
  user?: Partial<User>;
}): EmailVerificationTokenEntity {
  return {
    id: param.emailVerificationToken.id,
    userId: param.emailVerificationToken.userId,
    token: param.emailVerificationToken.token,
    expiresAt: param.emailVerificationToken.expiresAt,
    createdAt: param.emailVerificationToken.createdAt,
    User: param.user ? mapToPartialUserEntity({ user: param.user }) : null,
  };
}
