import { User, UserSession } from '../../generated/prisma';
import { mapToPartialUserEntity, UserEntity } from './user.entity';

export class UserSessionEntity {
  id: number;
  userId: number;
  token: string;
  deviceInfo?: string | null;
  ipAddress?: string | null;
  lastActivity: Date;
  expiryTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  User?: Partial<UserEntity> | null;

  constructor(params: {
    id: number;
    userId: number;
    token: string;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    lastActivity?: Date;
    expiryTime: Date;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
    User?: Partial<UserEntity> | null;
  }) {
    this.id = params.id ?? 0;
    this.userId = params.userId;
    this.token = params.token;
    this.deviceInfo = params.deviceInfo ?? null;
    this.ipAddress = params.ipAddress ?? null;
    this.lastActivity = params.lastActivity ?? new Date();
    this.expiryTime = params.expiryTime;
    this.isActive = params.isActive ?? true;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? null;
    this.User = params.User;
  }
}

export function mapToUserSessionEntity(param: {
  userSession: UserSession;
  user?: Partial<User>;
}): UserSessionEntity {
  return {
    id: param.userSession.id,
    userId: param.userSession.userId,
    token: param.userSession.token,
    deviceInfo: param.userSession.deviceInfo,
    ipAddress: param.userSession.ipAddress,
    lastActivity: param.userSession.lastActivity,
    expiryTime: param.userSession.expiryTime,
    isActive: param.userSession.isActive,
    createdAt: param.userSession.createdAt,
    updatedAt: param.userSession.updatedAt,
    User: param.user ? mapToPartialUserEntity({ user: param.user }) : null,
  };
}
