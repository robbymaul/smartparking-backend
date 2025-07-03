import { ApiProperty } from '@nestjs/swagger';
import {
  mapToTariffRateDtoResponse,
  TariffRateDtoParams,
  TariffRateDtoResponse,
} from './tariff.rate.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DayCategory, SlotType, VehicleType } from '../../common/enum/enum';
import Decimal from 'decimal.js';
import { Type } from 'class-transformer';

export class TariffPlanDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  placeId: number;

  @ApiProperty({ example: 'Weekday Plan' })
  planName: string;

  @ApiProperty({ example: 'Tarif khusus untuk hari kerja', nullable: true })
  description: string | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  effectiveFrom: string;

  @ApiProperty({ example: '2024-12-31T00:00:00.000Z', nullable: true })
  effectiveUntil: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ type: [TariffRateDtoResponse], required: false })
  tariffRate?: TariffRateDtoResponse[];
}

interface TariffPlanDtoParams {
  id: number;
  placeId: number;
  planName: string;
  description: string | null;
  effectiveFrom: Date;
  effectiveUntil: Date | null;
  isActive: boolean;
  TariffRate?: TariffRateDtoParams[];
}

export const mapToTariffPlanDtoResponse = (
  param: TariffPlanDtoParams,
): TariffPlanDtoResponse => {
  return {
    id: param.id,
    placeId: param.placeId,
    planName: param.planName,
    description: param.description,
    effectiveFrom: param.effectiveFrom.toISOString(),
    effectiveUntil: param.effectiveUntil
      ? param.effectiveUntil.toISOString()
      : null,
    isActive: param.isActive,
    tariffRate: param.TariffRate?.map((tariffRate) =>
      mapToTariffRateDtoResponse(tariffRate),
    ),
  };
};

export class TariffPlanRequestDto {
  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  effectiveFrom: string;

  @IsString()
  effectiveUntil: string;

  @ValidateNested({ each: true })
  @Type(() => TariffRateRequestDto)
  tariffRates: TariffRateRequestDto[];
}

export class TariffRateRequestDto {
  @IsEnum(VehicleType, {
    message: 'slot type [Car]',
  })
  vehicleType: string;

  @IsEnum(SlotType, {
    message: 'slot type [Regular, VIP]',
  })
  slotType: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(DayCategory, {
    message: 'day category [Weekday, Weekend]',
  })
  dayCategory: DayCategory;

  @IsNumber()
  basePrice: Decimal;

  @IsNumber()
  hourlyRate: Decimal;

  @IsNumber()
  dayRate: Decimal;

  @IsNumber()
  minimumCharge: Decimal;

  @IsNumber()
  gracePeriodMinute: number;
}
