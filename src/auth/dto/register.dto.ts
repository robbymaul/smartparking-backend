import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserEntity } from '../../entities/user.entity';
import { UserProfileEntity } from '../../entities/user.profile.entity';
import { AccountType } from '../interface/acount.type';

export class RegisterRequestDto {
  @ApiProperty({
    description: 'Username untuk login',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh berisi huruf, angka, dan underscore',
  })
  username: string;

  @ApiProperty({
    description: 'Email pengguna',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
  })
  password: string;

  @ApiProperty({
    description: 'Nomor telepon',
    example: '+62812345678',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Tipe akun',
    enum: AccountType,
    default: 'regular',
    required: false,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: string = 'regular';

  @ApiProperty({
    description: 'Nama depan',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Nama belakang',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Username untuk login',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh berisi huruf, angka, dan underscore',
  })
  username: string;

  @ApiProperty({
    description: 'Email pengguna',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nomor telepon',
    example: '+62812345678',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Tipe akun',
    enum: AccountType,
    default: 'regular',
    required: false,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: string = 'regular';

  @ApiProperty({
    description: 'Nama depan',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'Nama belakang',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export function mapToRegisterResponseDto(params: {
  user: UserEntity;
  profile?: UserProfileEntity;
}): RegisterResponseDto {
  const { user, profile } = params;

  return {
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber ?? undefined,
    accountType: user.accountType,
    firstName: profile?.firstName ?? undefined,
    lastName: profile?.lastName ?? undefined,
  };
}
