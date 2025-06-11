import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { DayOfWeek } from '../../common/enum/enum';

export class OperatingHourDtoResponse {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  placeId: number;

  @ApiProperty({ example: 'Monday' })
  @IsString()
  dayOfWeek: string;

  @ApiProperty({ example: '09:00:00', nullable: true, type: String })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'openingTime harus format HH:mm:ss',
  })
  openingTime: string | null;

  @ApiProperty({ example: '17:00:00', nullable: true, type: String })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'closingTime harus format HH:mm:ss',
  })
  closingTime: string | null;

  @ApiProperty({ example: false })
  @IsBoolean()
  is24Hours: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
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

export class OperatingHourRequestDto {
  @IsEnum(DayOfWeek, {
    message:
      'dayOfWeek harus salah satu dari 7 hari dalam seminggu (senin - minggu)',
  })
  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'openingTime harus format HH:mm:ss',
  })
  openingTime: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'openingTime harus format HH:mm:ss',
  })
  closingTime: string;

  @IsBoolean()
  is24Hours: boolean;

  @IsBoolean()
  isClosed: boolean;
}
