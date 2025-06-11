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
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PlaceType } from 'src/common/enum/enum';

export class PlaceResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Mall Central Park' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dxdtxld4f/image/upload/v1738768682/skripsi/image_mall1_ixzb6u.jpg',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 'mall' })
  @IsEnum(PlaceType, {
    message: 'type must be either office or mall',
  })
  placeType: PlaceType;

  @ApiProperty({ example: 'Jl. Letjen S. Parman No.28, Jakarta Barat' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: -6.175392 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 106.827153 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '+6221567890', required: false })
  @IsString()
  @IsOptional()
  contactNumber: string;

  @ApiProperty({ example: 'info@centralparkmall.co.id', required: false })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({
    example: 'Pusat perbelanjaan terbesar di Jakarta Barat',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  totalCapacity: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: '2024-10-01T12:00:00Z' })
  createdAt: Date;

  // @ApiProperty({ type: [PlaceRatingDto], required: false })
  // placeRatings?: PlaceRatingDto[];
  //
  @ApiProperty({ type: [OperatingHourDtoResponse], required: false })
  operatingHour?: OperatingHourDtoResponse[];

  @ApiProperty({ type: [TariffPlanDtoResponse], required: false })
  tariffPlan?: TariffPlanDtoResponse[];
}

export function mapToPlaceResponseDto(
  placeEntity: PlaceEntity,
): PlaceResponseDto {
  let placeType: PlaceType;
  switch (placeEntity.placeType) {
    case PlaceType.MALL:
      placeType = PlaceType.MALL;
      break;
    case PlaceType.OFFICE:
      placeType = PlaceType.OFFICE;
      break;

    default:
      placeType = PlaceType.UNKNOWN;
  }
  return {
    id: placeEntity.id,
    name: placeEntity.name,
    image:
      placeEntity.image ||
      'https://res.cloudinary.com/dxdtxld4f/image/upload/v1738768682/skripsi/image_mall1_ixzb6u.jpg',
    placeType: placeType,
    address: placeEntity.address,
    latitude: Number(placeEntity.latitude),
    longitude: Number(placeEntity.longitude),
    contactNumber: placeEntity.contactNumber || '',
    email: placeEntity.email || '',
    description: placeEntity.description || '',
    totalCapacity: placeEntity.totalCapacity,
    isActive: placeEntity.isActive,
    createdAt: placeEntity.createdAt,

    // placeRatings: placeEntity.placeRatings?.map((rating) => ({
    //   rating: rating.rating,
    //   comment: rating.comment,
    //   createdAt: rating.createdAt,
    // })),
    //
    operatingHour: placeEntity.OperatingHour?.map((hour) =>
      mapToOperatingHourDtoResponse(hour),
    ),

    tariffPlan: placeEntity.TariffPlan?.map((plan) =>
      mapToTariffPlanDtoResponse(plan),
    ),
  };
}

export class RegisterPlacesRequestDto {
  @ApiProperty({ example: 'Mall Central Park' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  name: string;

  @ApiProperty({ example: 'office' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(PlaceType, {
    message: 'type must be either office or mall',
  })
  placeType: PlaceType;

  @ApiProperty({ example: 'Jl. Letjen S. Parman No.28, Jakarta Barat' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: -6.175392 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 106.827153 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '+6221567890', required: false })
  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @ApiProperty({ example: 'info@centralparkmall.co.id', required: false })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'Pusat perbelanjaan terbesar di Jakarta Barat',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
