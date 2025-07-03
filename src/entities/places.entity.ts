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
  distance?: number;

  constructor(partial: Partial<PlaceEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToPlaceEntity(param: {
  place: Place;
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
  }[];
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
  })[];
  distance?: any;
}): PlaceEntity {
  return new PlaceEntity({
    id: param.place.id,
    name: param.place.name,
    image: param.place.image,
    placeType: param.place.placeType,
    address: param.place.address,
    latitude: param.place.latitude?.toNumber(),
    longitude: param.place.longitude?.toNumber(),
    contactNumber: param.place.contactNumber,
    email: param.place.email,
    description: param.place.description,
    totalCapacity: param.place.totalCapacity,
    isActive: param.place.isActive,
    OperatingHour: param.operatingHours?.map((operatingHour) =>
      mapToOperatingHourEntity(operatingHour),
    ),
    TariffPlan: param.tariffPlans?.map((tariffPlan) =>
      mapToTariffPlanEntity(tariffPlan),
    ),
    createdAt: param.place.createdAt,
    updatedAt: param.place.updatedAt,
    distance: param.distance,
  });
}
