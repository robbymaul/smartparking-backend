import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Jumlah yang akan direfund (jika kosong, refund penuh)',
    required: false,
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({
    description: 'Alasan refund',
    example: 'Customer request',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason: string;
}
