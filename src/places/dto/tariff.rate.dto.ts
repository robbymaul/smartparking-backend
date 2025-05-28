import { ApiProperty } from '@nestjs/swagger';
import Decimal from 'decimal.js';

export class TariffRateDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 101 })
  planId: number;

  @ApiProperty({ example: 'car' })
  vehicleType: string;

  @ApiProperty({ example: 'regular' })
  slotType: string;

  @ApiProperty({ example: '08:00:00', nullable: true, type: String })
  startTime: string | null;

  @ApiProperty({ example: '18:00:00', nullable: true, type: String })
  endTime: string | null;

  @ApiProperty({ example: 'WEEKDAY', nullable: true })
  dayCategory: string | null;

  @ApiProperty({ example: '5000.00' })
  basePrice: string;

  @ApiProperty({ example: '2000.00' })
  hourlyRate: string;

  @ApiProperty({ example: '20000.00', nullable: true })
  dayRate: string | null;

  @ApiProperty({ example: '3000.00' })
  minimumCharge: string;

  @ApiProperty({ example: 15 })
  gracePeriodMinutes: number;
}

export interface TariffRateDtoParams {
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
}

export const mapToTariffRateDtoResponse = (
  param: TariffRateDtoParams,
): TariffRateDtoResponse => {
  return {
    id: param.id,
    planId: param.planId,
    vehicleType: param.vehicleType,
    slotType: param.slotType,
    startTime: param.startTime
      ? param.startTime.toISOString().split('T')[1].split('.')[0]
      : null,
    endTime: param.endTime
      ? param.endTime.toISOString().split('T')[1].split('.')[0]
      : null,
    dayCategory: param.dayCategory,
    basePrice: param.basePrice.toString(),
    hourlyRate: param.hourlyRate.toString(),
    dayRate: param.dayRate ? param.dayRate.toString() : null,
    minimumCharge: param.minimumCharge.toString(),
    gracePeriodMinutes: param.gracePeriodMinutes,
  };
};
