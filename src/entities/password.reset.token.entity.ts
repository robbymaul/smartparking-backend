import { PasswordResetToken } from '../../generated/prisma';

export class PasswordResetTokenEntity {
  id?: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(param: {
    id?: number;
    userId: number;
    token: string;
    expiresAt: Date;
    createdAt: Date;
  }) {
    this.id = param.id;
    this.userId = param.userId;
    this.token = param.token;
    this.expiresAt = param.expiresAt;
    this.createdAt = param.createdAt;
  }
}

export function mapToPasswordResetTokenEntity(param: {
  token: PasswordResetToken;
}): PasswordResetTokenEntity {
  return new PasswordResetTokenEntity({
    id: param.token.id,
    userId: param.token.userId,
    token: param.token.token,
    expiresAt: param.token.expiresAt,
    createdAt: param.token.createdAt,
  });
}
