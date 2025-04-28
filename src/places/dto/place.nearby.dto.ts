import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyPlaceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  latitude: number;
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  longitude: number;
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  radius: number; // in meters

  constructor(param: { latitude: number; longitude: number; radius: number }) {
    this.latitude = param.latitude;
    this.longitude = param.longitude;
    this.radius = param.radius;
  }
}
