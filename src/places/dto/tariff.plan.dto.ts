import { ApiProperty } from '@nestjs/swagger';
import {
  mapToTariffRateDtoResponse,
  TariffRateDtoParams,
  TariffRateDtoResponse,
} from './tariff.rate.dto';

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
