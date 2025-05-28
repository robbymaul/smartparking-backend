import { ApiProperty } from '@nestjs/swagger';
import { SlotAvailabilityDtoResponse } from './slot.availability.dto';

export class ParkingSlotDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  zoneId: number;

  @ApiProperty({ example: 'A1' })
  slotNumber: string;

  @ApiProperty({ example: 'regular' })
  slotType: string;

  @ApiProperty({ example: false })
  isReserved: boolean;

  @ApiProperty({ example: true })
  isOccupied: boolean;

  @ApiProperty({ example: false })
  isDisabledFriendly: boolean;

  @ApiProperty({ example: true })
  hasEvCharger: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: [SlotAvailabilityDtoResponse], required: false })
  SlotAvailability?: SlotAvailabilityDtoResponse[];
}

interface ParkingSlotDtoParams {
  id: number;
  zoneId: number;
  slotNumber: string;
  slotType: string;
  isReserved: boolean;
  isOccupied: boolean;
  isDisabledFriendly: boolean;
  hasEvCharger: boolean;
  isActive: boolean;
  SlotAvailability?: SlotAvailabilityDtoResponse[];
}

export const mapToParkingSlotDtoResponse = (
  param: ParkingSlotDtoParams,
): ParkingSlotDtoResponse => {
  return {
    id: param.id,
    zoneId: param.zoneId,
    slotNumber: param.slotNumber,
    slotType: param.slotType,
    isReserved: param.isReserved,
    isOccupied: param.isOccupied,
    isDisabledFriendly: param.isDisabledFriendly,
    hasEvCharger: param.hasEvCharger,
    isActive: param.isActive,
    SlotAvailability: param.SlotAvailability,
  };
};
