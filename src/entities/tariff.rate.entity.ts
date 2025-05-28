import Decimal from 'decimal.js';

export class TariffRateEntity {
  id: number;
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
  constructor(partial: Partial<TariffRateEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToTariffRateEntity(tariffRate: {
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
}): TariffRateEntity {
  return new TariffRateEntity({
    id: tariffRate.id,
    planId: tariffRate.planId,
    vehicleType: tariffRate.vehicleType,
    slotType: tariffRate.slotType,
    startTime: tariffRate.startTime,
    endTime: tariffRate.endTime,
    dayCategory: tariffRate.dayCategory,
    basePrice: tariffRate.basePrice,
    hourlyRate: tariffRate.hourlyRate,
    dayRate: tariffRate.dayRate,
    minimumCharge: tariffRate.minimumCharge,
    gracePeriodMinutes: tariffRate.gracePeriodMinutes,
  });
}
