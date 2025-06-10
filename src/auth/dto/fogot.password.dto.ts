import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email pengguna',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'Nomor telepon pengguna untuk reset password',
    example: '+628123456789',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyForgotPasswordOtpRequestDto {
  @ApiProperty({
    description: 'Nomor telepon pengguna untuk verifikasi',
    example: '+628123456789',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Kode OTP yang diterima via SMS',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 5)
  otp: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Nomor telepon pengguna',
    example: '+628123456789',
  })
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Token reset password',
    example: 'abcdef123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Password baru',
    example: 'NewStrongP@ssw0rd',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Konfirmasi password baru',
    example: 'NewStrongP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
