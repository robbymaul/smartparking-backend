import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'ID metode pembayaran yang digunakan',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  paymentMethodId: number;

  @ApiProperty({
    description:
      'Apakah menyimpan metode pembayaran untuk penggunaan di masa depan',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  savePaymentMethod?: boolean;

  @ApiProperty({
    description:
      'Detail tambahan untuk pemrosesan pembayaran (tergantung gateway)',
    required: false,
    example: {
      card_number: '4811********1114',
      expiry_month: 12,
      expiry_year: 2025,
      cvv: '123',
    },
  })
  @IsOptional()
  paymentDetails?: Record<string, any>;
}
