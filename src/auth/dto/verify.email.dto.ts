import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailRequestDto {
  @ApiProperty({
    description: 'Token verifikasi email',
    example: 'abcdef123456',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationEmailDto {
  @ApiProperty({
    description: 'Email pengguna yang ingin dikirim ulang token verifikasi',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
