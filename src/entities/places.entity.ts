import { Place } from 'generated/prisma';
import {
  mapToOperatingHourEntity,
  OperatingHourEntity,
} from './operating.hours.entity';
import { Decimal } from 'generated/prisma/runtime/library';
import { mapToTariffPlanEntity, TariffPlanEntity } from './tariff.plan.entity';

export class PlaceEntity {
  id: number;
  name: string;
  image: string | null;
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
  OperatingHour?: OperatingHourEntity[];
  TariffPlan?: TariffPlanEntity[];

  constructor(partial: Partial<PlaceEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToPlaceEntity(
  place: Place,
  operatingHours?: {
    id: number;
    placeId: number;
    dayOfWeek: string;
    openingTime: Date | null;
    closingTime: Date | null;
    is24hours: boolean;
    isClosed: boolean;
    createdAt: Date;
    updatedAt: Date | null;
  }[],
  tariffPlans?: ({
    tariffRates: {
      id: number;
      createdAt: Date;
      updatedAt: Date | null;
      planId: number;
      vehicleType: string;
      slotType: string;
      startTime: Date | null;
      endTime: Date | null;
      dayCategory: string | null;
      basePrice: Decimal;
      hourlyRate: Decimal;
      dayRate: Decimal | null;
      minimumCharge: Decimal;
      gracePeriodMinutes: number;
    }[];
  } & {
    id: number;
    placeId: number;
    createdAt: Date;
    updatedAt: Date | null;
    description: string | null;
    isActive: boolean;
    planName: string;
    effectiveFrom: Date;
    effectiveUntil: Date | null;
  })[],
): PlaceEntity {
  return new PlaceEntity({
    id: place.id,
    name: place.name,
    image: place.image,
    placeType: place.placeType,
    address: place.address,
    latitude: place.latitude?.toNumber(),
    longitude: place.longitude?.toNumber(),
    contactNumber: place.contactNumber,
    email: place.email,
    description: place.description,
    totalCapacity: place.totalCapacity,
    isActive: place.isActive,
    OperatingHour: operatingHours?.map((operatingHour) =>
      mapToOperatingHourEntity(operatingHour),
    ),
    TariffPlan: tariffPlans?.map((tariffPlan) =>
      mapToTariffPlanEntity(tariffPlan),
    ),
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  });
}
