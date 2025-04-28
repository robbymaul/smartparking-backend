import { ApiProperty } from '@nestjs/swagger';
import { PlaceEntity } from '../../entities/places.entity';

export class PlaceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mall Central Park' })
  name: string;

  @ApiProperty({ example: 'mall' })
  placeType: string;

  @ApiProperty({ example: 'Jl. Letjen S. Parman No.28, Jakarta Barat' })
  address: string;

  @ApiProperty({ example: -6.175392 })
  latitude: number;

  @ApiProperty({ example: 106.827153 })
  longitude: number;

  @ApiProperty({ example: '+6221567890', required: false })
  contactNumber: string | null;

  @ApiProperty({ example: 'info@centralparkmall.co.id', required: false })
  email: string | null;

  @ApiProperty({
    example: 'Pusat perbelanjaan terbesar di Jakarta Barat',
    required: false,
  })
  description: string | null;

  @ApiProperty({ example: 1000 })
  totalCapacity: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-10-01T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-10-10T15:30:00Z' })
  updatedAt: Date | null;

  // @ApiProperty({ type: [PlaceRatingDto], required: false })
  // placeRatings?: PlaceRatingDto[];
  //
  // @ApiProperty({ type: [OperatingHourDto], required: false })
  // operatingHours?: OperatingHourDto[];
  //
  // @ApiProperty({ type: [TariffPlanDto], required: false })
  // tariffPlans?: TariffPlanDto[];
}

export function mapToPlaceResponseDto(entity: PlaceEntity): PlaceResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    placeType: entity.placeType,
    address: entity.address,
    latitude: Number(entity.latitude),
    longitude: Number(entity.longitude),
    contactNumber: entity.contactNumber,
    email: entity.email,
    description: entity.description,
    totalCapacity: entity.totalCapacity,
    isActive: entity.isActive,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,

    // placeRatings: entity.placeRatings?.map((rating) => ({
    //   rating: rating.rating,
    //   comment: rating.comment,
    //   createdAt: rating.createdAt,
    // })),
    //
    // operatingHours: entity.operatingHours?.map((hour) => ({
    //   day: hour.day,
    //   openTime: hour.openTime,
    //   closeTime: hour.closeTime,
    // })),
    //
    // tariffPlans: entity.tariffPlans?.map((plan) => ({
    //   name: plan.name,
    //   rate: plan.rate,
    //   unit: plan.unit,
    // })),
  };
}
