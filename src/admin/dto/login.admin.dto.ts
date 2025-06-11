import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminRequestDto {
  @ApiProperty({
    description: 'email login',
    example: 'email@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LoginAdminResponseDto {
  @ApiProperty({
    description: 'token login',
    example: 'token......asdsakdoaks...',
    type: 'string',
  })
  token: string;
}
