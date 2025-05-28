import {
  mapToParkingSlotEntity,
  ParkingSlotEntity,
} from './parking.slot.entity';
import { ParkingZone } from 'generated/prisma';

export class ParkingZoneEntity {
  id: number;
  placeId: number;
  zoneName: string;
  floorLevel: string | null;
  zoneType: string | null;
  totalSlots: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  ParkingSlots?: ParkingSlotEntity[];

  constructor(partial: Partial<ParkingZoneEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToParkingZoneEntity(
  zone: ParkingZone,
  parkingSlots?: ({
    slotAvailability: {
      id: number;
      createdAt: Date;
      updatedAt: Date | null;
      slotId: number;
      availableFrom: Date;
      availableUntil: Date;
      isBookable: boolean;
      statusReason: string | null;
    }[];
  } & {
    id: number;
    zoneId: number;
    slotNumber: string;
    slotType: string;
    isReserved: boolean;
    isOccupied: boolean;
    isDisabledFriendly: boolean;
    hasEvCharger: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date | null;
  })[],
): ParkingZoneEntity {
  return new ParkingZoneEntity({
    id: zone.id,
    placeId: zone.placeId,
    zoneName: zone.zoneName,
    floorLevel: zone.floorLevel,
    zoneType: zone.zoneType,
    totalSlots: zone.totalSlots,
    isActive: zone.isActive,
    createdAt: zone.createdAt,
    updatedAt: zone.updatedAt,
    ParkingSlots: parkingSlots?.map((value) =>
      mapToParkingSlotEntity({
        slot: value,
        slotAvailability: value.slotAvailability,
      }),
    ),
  });
}
