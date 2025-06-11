import { OperatingHour } from 'generated/prisma';

export class OperatingHourEntity {
  id: number;
  placeId: number;
  dayOfWeek: string;
  openingTime: Date | null;
  closingTime: Date | null;
  is24Hours: boolean;
  isClosed: boolean;

  constructor(partial: Partial<OperatingHourEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToOperatingHourEntity(
  operatingHours: OperatingHour,
): OperatingHourEntity {
  return new OperatingHourEntity({
    id: operatingHours.id,
    placeId: operatingHours.placeId,
    dayOfWeek: operatingHours.dayOfWeek,
    openingTime: operatingHours.openingTime,
    closingTime: operatingHours.closingTime,
    is24Hours: operatingHours.is24hours,
    isClosed: operatingHours.isClosed,
  });
}
