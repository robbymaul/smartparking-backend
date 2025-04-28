import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Username atau email atau phone number untuk login',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  usernameOrEmailOrPhoneNumber: string;

  @ApiProperty({
    description: 'Password',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'access token',
    example: 'accesstoken.......',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}

export function mapToLoginResponseDto(params: {
  token: string;
}): LoginResponseDto {
  const { token } = params;

  return {
    accessToken: token,
  };
}
