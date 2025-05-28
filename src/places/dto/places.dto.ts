import { ApiProperty } from '@nestjs/swagger';
import { PlaceEntity } from '../../entities/places.entity';
import {
  mapToOperatingHourDtoResponse,
  OperatingHourDtoResponse,
} from './operating.hour.dto';
import {
  mapToTariffPlanDtoResponse,
  TariffPlanDtoResponse,
} from './tariff.plan.dto';

export class PlaceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mall Central Park' })
  name: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dxdtxld4f/image/upload/v1738768682/skripsi/image_mall1_ixzb6u.jpg',
  })
  image: string;

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
  @ApiProperty({ type: [OperatingHourDtoResponse], required: false })
  operatingHour?: OperatingHourDtoResponse[];

  @ApiProperty({ type: [TariffPlanDtoResponse], required: false })
  tariffPlan?: TariffPlanDtoResponse[];
}

export function mapToPlaceResponseDto(entity: PlaceEntity): PlaceResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    image:
      'https://res.cloudinary.com/dxdtxld4f/image/upload/v1738768682/skripsi/image_mall1_ixzb6u.jpg',
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
    operatingHour: entity.OperatingHour?.map((hour) =>
      mapToOperatingHourDtoResponse(hour),
    ),

    tariffPlan: entity.TariffPlan?.map((plan) =>
      mapToTariffPlanDtoResponse(plan),
    ),
  };
}
