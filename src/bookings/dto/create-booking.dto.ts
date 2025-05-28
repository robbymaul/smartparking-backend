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
import { BookingStatus } from '../interfaces/booking-status.interface';

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

export class BookingResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/dxdtxld4f/image/upload/v1747842775/parking/qrcodes/parking/qrcodes/SPB_331E79A2.png',
  })
  @IsString()
  qrCode: string;

  @ApiProperty({ example: 'MC-302518701' })
  @IsString()
  bookingReference: string;

  @ApiProperty({ example: 'paid' })
  @IsString()
  payment: string;

  @ApiProperty({ example: BookingStatus.ACTIVE })
  @IsString()
  status: string;

  @ApiProperty({ example: 'Slot-Number' })
  @IsString()
  slotNumber: string;

  @ApiProperty({ example: 'Robby Maulana' })
  @IsString()
  name: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Car' })
  @IsString()
  vehicle: string;

  @ApiProperty({ example: 'B7887IUY' })
  @IsString()
  licencePlate: string;

  @ApiProperty({ example: '10:10AM' })
  @IsString()
  startTime: Date;

  @ApiProperty({ example: '10:10AM' })
  @IsString()
  endTime: Date;

  @ApiProperty({ example: 'Margonda City Mall' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Jalan Margonda Raya Kota Depok Jawa Barat' })
  @IsString()
  address: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  adminFee: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  discount: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  estimatedPrice: number;
}
