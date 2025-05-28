import { ParkingSlot } from '../../generated/prisma';
import { SlotAvailabilityEntity } from './slot.availability.entity';

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
  updatedAt: Date | null;
  SlotAvailability?: SlotAvailabilityEntity[];

  constructor(partial: Partial<ParkingSlotEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToParkingSlotEntity(param: {
  slot: ParkingSlot;
  slotAvailability?: {
    id: number;
    createdAt: Date;
    updatedAt: Date | null;
    slotId: number;
    availableFrom: Date;
    availableUntil: Date;
    isBookable: boolean;
    statusReason: string | null;
  }[];
  parkingZone?: {
    id: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date | null;
    placeId: number;
    zoneName: string;
    floorLevel: string | null;
    zoneType: string | null;
    totalSlots: number;
  };
}): ParkingSlotEntity {
  return new ParkingSlotEntity({
    id: param.slot.id,
    zoneId: param.slot.zoneId,
    slotNumber: param.slot.slotNumber,
    slotType: param.slot.slotType,
    isReserved: param.slot.isReserved,
    isOccupied: param.slot.isOccupied,
    isDisabledFriendly: param.slot.isDisabledFriendly,
    hasEvCharger: param.slot.hasEvCharger,
    isActive: param.slot.isActive,
    createdAt: param.slot.createdAt,
    updatedAt: param.slot.updatedAt,
    SlotAvailability: param.slotAvailability,
  });
}
