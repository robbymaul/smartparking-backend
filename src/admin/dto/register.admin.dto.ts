import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoleAdmin } from '../enum/role.enum';

export class RegisterAdminRequestDto {
  @ApiProperty({ example: 'info@centralparkmall.co.id' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Robby Maulana' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Robby Maulana' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(RoleAdmin)
  role: RoleAdmin;

  @ApiProperty({ example: '+6282123456789' })
  @IsNotEmpty()
  @IsString()
  contactNumber: string;
}
