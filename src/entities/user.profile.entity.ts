import { UserProfile } from '../../generated/prisma';

export class UserProfileEntity {
  id?: number;
  userId?: number;
  firstName: string | null;
  lastName: string | null;
  profilePhoto: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(params: UserProfileEntity) {
    Object.assign(this, params);
  }
}

export function mapToUserProfileEntity(param: {
  profile: UserProfile;
}): UserProfileEntity {
  const { profile } = param;

  return {
    id: profile.id,
    userId: profile.userId,
    firstName: profile.firstName ?? null,
    lastName: profile.lastName ?? null,
    profilePhoto: profile.profilePhoto ?? null,
    gender: profile.gender ?? null,
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
    address: profile.address ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    postalCode: profile.postalCode ?? null,
    country: profile.country ?? null,
    createdAt: new Date(profile.createdAt),
    updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : null,
  };
}
