import { Place } from '../../generated/prisma';

export class PlaceEntity {
  id: number;
  name: string;
  placeType: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  contactNumber: string | null;
  email: string | null;
  description: string | null;
  totalCapacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(partial: Partial<PlaceEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToPlaceEntity(place: Place): PlaceEntity {
  return new PlaceEntity({
    id: place.id,
    name: place.name,
    placeType: place.placeType,
    address: place.address,
    latitude: place.latitude?.toNumber(),
    longitude: place.longitude?.toNumber(),
    contactNumber: place.contactNumber,
    email: place.email,
    description: place.description,
    totalCapacity: place.totalCapacity,
    isActive: place.isActive,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  });
}
