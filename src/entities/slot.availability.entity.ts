import { SlotAvailability } from 'generated/prisma';

export class SlotAvailabilityEntity {
  id: number;
  slotId: number;
  availableFrom: Date;
  availableUntil: Date;
  isBookable: boolean;
  statusReason: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(partial: Partial<SlotAvailabilityEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToSlotAvailabilityEntity(
  availability: SlotAvailability,
): SlotAvailabilityEntity {
  return new SlotAvailabilityEntity({
    id: availability.id,
    slotId: availability.slotId,
    availableFrom: availability.availableFrom,
    availableUntil: availability.availableUntil,
    isBookable: availability.isBookable,
    statusReason: availability.statusReason,
    createdAt: availability.createdAt,
    updatedAt: availability.updatedAt,
  });
}
