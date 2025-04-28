import { User, UserProfile, Vehicle } from '../../generated/prisma';
import {
  mapToUserProfileEntity,
  UserProfileEntity,
} from './user.profile.entity';
import { mapToVehicleEntity, VehicleEntity } from './vehicle.entity';

export class UserEntity {
  id?: number;
  username: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  accountType: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: string;
  googleId: string | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
  Profile?: UserProfileEntity;
  Vehicle?: VehicleEntity[];

  constructor(param: {
    id?: number;
    username: string;
    email: string;
    passwordHash: string;
    phoneNumber: string;
    accountType: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    accountStatus: string;
    googleId: string | null;
    lastLogin?: Date | null;
    createdAt: Date;
    updatedAt?: Date | null;
    Profile?: UserProfileEntity;
  }) {
    this.id = param.id;
    this.username = param.username;
    this.email = param.email;
    this.passwordHash = param.passwordHash;
    this.phoneNumber = param.phoneNumber;
    this.accountType = param.accountType;
    this.emailVerified = param.emailVerified;
    this.phoneVerified = param.phoneVerified;
    this.accountStatus = param.accountStatus;
    this.googleId = param.googleId;
    this.lastLogin = param.lastLogin;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
    this.Profile = param.Profile;
  }
}

export function mapToUserEntity(param: {
  user: User;
  profile?: UserProfile | null;
  vehicle?: Vehicle[];
}): UserEntity {
  const { user, profile } = param;

  return {
    id: user.id ?? 0,
    username: user.username ?? '',
    email: user.email ?? '',
    passwordHash: user.passwordHash ?? '',
    phoneNumber: user.phoneNumber ?? '',
    accountType: user.accountType ?? 'standard',
    emailVerified: user.emailVerified ?? false,
    phoneVerified: user.phoneVerified ?? false,
    accountStatus: user.accountStatus ?? 'inactive',
    googleId: user.googleId ?? null,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
    Profile: profile ? mapToUserProfileEntity({ profile }) : undefined,
    Vehicle: param.vehicle?.map((value) => mapToVehicleEntity(value)),
  };
}

export function mapToPartialUserEntity(param: {
  user: Partial<User>;
}): Partial<UserEntity> {
  return {
    id: param.user.id ?? 0,
    accountStatus: param.user.accountStatus ?? 'inactive',
  };
}
