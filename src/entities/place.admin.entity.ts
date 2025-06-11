import { PlaceAdmin } from 'generated/prisma';

export class PlaceAdminEntity {
  id: number;
  placeId: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: string;
  contactNumber: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(partial: Partial<PlaceAdminEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToPlaceAdminEntity(
  placeAdmin: PlaceAdmin,
): PlaceAdminEntity {
  return {
    contactNumber: placeAdmin.contactNumber,
    createdAt: placeAdmin.createdAt,
    email: placeAdmin.email,
    fullName: placeAdmin.fullName,
    id: placeAdmin.id,
    isActive: placeAdmin.isActive,
    passwordHash: placeAdmin.passwordHash,
    placeId: placeAdmin.placeId,
    role: placeAdmin.role,
    updatedAt: placeAdmin.updatedAt,
    username: placeAdmin.username,
  };
}
