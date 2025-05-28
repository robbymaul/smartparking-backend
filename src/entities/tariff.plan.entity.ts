import Decimal from 'decimal.js';
import { mapToTariffRateEntity, TariffRateEntity } from './tariff.rate.entity';

export class TariffPlanEntity {
  id: number;
  placeId: number;
  planName: string;
  description: string | null;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  isActive: boolean;
  TariffRate: TariffRateEntity[];

  constructor(partial: Partial<TariffPlanEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToTariffPlanEntity(
  tariffPlan: {
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
  },
): TariffPlanEntity {
  return new TariffPlanEntity({
    id: tariffPlan.id,
    placeId: tariffPlan.id,
    planName: tariffPlan.planName,
    description: tariffPlan.description,
    effectiveFrom: tariffPlan.effectiveFrom,
    effectiveUntil: tariffPlan.effectiveUntil,
    isActive: tariffPlan.isActive,
    TariffRate: tariffPlan.tariffRates.map((tariffRate) =>
      mapToTariffRateEntity(tariffRate),
    ),
  });
}
