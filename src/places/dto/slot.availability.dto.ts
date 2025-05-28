import { ApiProperty } from '@nestjs/swagger';

export class SlotAvailabilityDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  slotId: number;

  @ApiProperty({ example: '2025-05-02T08:00:00Z' })
  availableFrom: Date;

  @ApiProperty({ example: '2025-05-02T18:00:00Z' })
  availableUntil: Date;

  @ApiProperty({ example: true })
  isBookable: boolean;

  @ApiProperty({ example: 'Maintenance' })
  statusReason: string | null;
}

interface SlotAvailabilityDtoParams {
  id: number;
  slotId: number;
  availableFrom: Date;
  availableUntil: Date;
  isBookable: boolean;
  statusReason: string | null;
}

export const mapToSlotAvailabilityDtoResponse = (
  param: SlotAvailabilityDtoParams,
): SlotAvailabilityDtoResponse => {
  return {
    id: param.id,
    slotId: param.slotId,
    availableFrom: param.availableFrom,
    availableUntil: param.availableUntil,
    isBookable: param.isBookable,
    statusReason: param.statusReason,
  };
};
