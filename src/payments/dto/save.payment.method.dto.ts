import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SavePaymentMethodDto {
  @ApiProperty({
    description: 'ID metode pembayaran (jenis)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  paymentMethodId: number;

  @ApiProperty({
    description: 'Token referensi dari payment gateway',
    example: 'tok_visa_12345',
  })
  @IsString()
  @IsNotEmpty()
  tokenReference: string;

  @ApiProperty({
    description: 'Informasi kartu termasked',
    example: '************1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  maskedInfo?: string;

  @ApiProperty({
    description: 'Info kadaluarsa (kartu)',
    example: '12/2025',
    required: false,
  })
  @IsOptional()
  @IsString()
  expiryInfo?: string;

  @ApiProperty({
    description: 'Jadikan metode pembayaran default',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class PaymentMethodResponseDto {
  @ApiProperty({
    description: 'ID metode pembayaran (jenis)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'name payment method',
    example: 'ovo',
  })
  @IsString()
  @IsNotEmpty()
  methodName: string;

  @ApiProperty({
    description: 'provider payment method',
    example: 'ovo',
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: 'methodType payment method',
    example: 'e-wallet',
  })
  @IsString()
  @IsNotEmpty()
  methodType: string;

  @ApiProperty({
    description: 'description payment method',
    example: 'Pembayaran melalui OVO via Midtrans',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
