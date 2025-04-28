import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString, Length } from 'class-validator';

export class VerifyPhoneRequestDto {
  @ApiProperty({
    description: 'Kode OTP untuk verifikasi nomor telepon',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}

export class SendPhoneOtpRequestDto {
  @ApiProperty({
    description: 'Nomor telepon yang akan dikirim OTP',
    example: '+628123456789',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
}
