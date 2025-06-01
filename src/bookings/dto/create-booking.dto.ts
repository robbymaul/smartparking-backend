import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID kendaraan yang akan digunakan',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty({
    description: 'ID slot parkir yang ingin direservasi',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  slotId: number;

  @ApiProperty({
    description: 'ID place yang ingin direservasi',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  placeId: number;

  @ApiProperty({
    description: 'Waktu masuk yang direncanakan (ISO format)',
    example: '2025-04-12T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledEntry: string;

  @ApiProperty({
    description: 'Waktu keluar yang direncanakan (ISO format)',
    example: '2025-04-12T15:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  scheduledExit: string;

  @ApiProperty({
    description: 'ID promo code (opsional)',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  promoCodeId: number | null;

  @ApiProperty({
    description: 'Catatan tambahan (opsional)',
    required: false,
    example: 'Parkir dekat lift jika memungkinkan',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateBookingResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'Booking-References' })
  @IsString()
  bookingReference: string;
}
