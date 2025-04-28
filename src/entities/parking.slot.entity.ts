import { ParkingSlot } from '../../generated/prisma';

export class ParkingSlotEntity {
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
  updatedAt?: Date;
}

export function mapToParkingSlotEntity(param: {
  parkingSlot: ParkingSlot;
}): ParkingSlotEntity {
  const { parkingSlot } = param;

  return {
    id: parkingSlot.id,
    zoneId: parkingSlot.zoneId,
    slotNumber: parkingSlot.slotNumber,
    slotType: parkingSlot.slotType,
    isReserved: parkingSlot.isReserved,
    isOccupied: parkingSlot.isOccupied,
    isDisabledFriendly: parkingSlot.isDisabledFriendly,
    hasEvCharger: parkingSlot.hasEvCharger,
    isActive: parkingSlot.isActive,
    createdAt: parkingSlot.createdAt,
    updatedAt: parkingSlot.updatedAt ?? undefined, // <-- fix here
  };
}
