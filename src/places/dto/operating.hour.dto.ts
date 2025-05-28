import { ApiProperty } from '@nestjs/swagger';

export class OperatingHourDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 10 })
  placeId: number;

  @ApiProperty({ example: 'Monday' })
  dayOfWeek: string;

  @ApiProperty({ example: '09:00:00', nullable: true, type: String })
  openingTime: string | null;

  @ApiProperty({ example: '17:00:00', nullable: true, type: String })
  closingTime: string | null;

  @ApiProperty({ example: false })
  is24Hours: boolean;

  @ApiProperty({ example: false })
  isClosed: boolean;
}

interface OperatingHourDtoParams {
  id: number;
  placeId: number;
  dayOfWeek: string;
  openingTime: Date | null;
  closingTime: Date | null;
  is24Hours: boolean;
  isClosed: boolean;
}

export const mapToOperatingHourDtoResponse = (
  param: OperatingHourDtoParams,
): OperatingHourDtoResponse => {
  return {
    id: param.id,
    placeId: param.placeId,
    dayOfWeek: param.dayOfWeek,
    openingTime: param.openingTime
      ? param.openingTime.toISOString().split('T')[1].split('.')[0]
      : null,
    closingTime: param.closingTime
      ? param.closingTime.toISOString().split('T')[1].split('.')[0]
      : null,
    is24Hours: param.is24Hours,
    isClosed: param.isClosed,
  };
};
