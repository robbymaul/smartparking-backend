import { ApiProperty } from '@nestjs/swagger';
import { ParkingSlotDtoResponse } from './parking.slot.dto';

export class ParkingZoneDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  placeId: number;

  @ApiProperty({ example: 'Zone A' })
  zoneName: string;

  @ApiProperty({ example: 'Lantai 1', required: false })
  floorLevel: string | null;

  @ApiProperty({ example: 'VIP', required: false })
  zoneType: string | null;

  @ApiProperty({ example: 30 })
  totalSlots: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-05-02T08:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-05-02T09:00:00Z', required: false })
  updatedAt: Date | null;

  @ApiProperty({ type: [ParkingSlotDtoResponse], required: false })
  ParkingSlots?: ParkingSlotDtoResponse[];
}

interface ParkingZoneDtoParams {
  id: number;
  placeId: number;
  zoneName: string;
  floorLevel: string | null;
  zoneType: string | null;
  totalSlots: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  ParkingSlots?: ParkingSlotDtoResponse[];
}

export const mapToParkingZoneDtoResponse = (
  param: ParkingZoneDtoParams,
): ParkingZoneDtoResponse => {
  return {
    id: param.id,
    placeId: param.placeId,
    zoneName: param.zoneName,
    floorLevel: param.floorLevel,
    zoneType: param.zoneType,
    totalSlots: param.totalSlots,
    isActive: param.isActive,
    createdAt: param.createdAt,
    updatedAt: param.updatedAt,
    ParkingSlots: param.ParkingSlots,
  };
};
