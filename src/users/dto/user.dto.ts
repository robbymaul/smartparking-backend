import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserEntity } from '../../entities/user.entity';

export class UpdatePasswordUserDto {
  @ApiProperty({ type: String, example: 'password' })
  @IsString()
  @MinLength(8)
  oldPassword: string;

  @ApiProperty({ type: String, example: 'password' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ type: String, example: 'password' })
  @IsString()
  @MinLength(8)
  confirmNewPassword: string;
}

export class GetUserResponseDto {
  @ApiProperty({ type: String, example: 'robbymaul' })
  @IsString()
  username: string;

  @ApiProperty({ type: String, example: 'robby@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, example: '+6281234567890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ type: String, example: 'standard' })
  @IsString()
  accountType: string;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  emailVerified: boolean;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  phoneVerified: boolean;

  @ApiProperty({ type: String, example: 'active' })
  @IsString()
  accountStatus: string;

  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  isVehicleActivated: boolean;
}

export function mapToGetUserResponseDto(user: UserEntity): GetUserResponseDto {
  return {
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    accountType: user.accountType,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    accountStatus: user.accountStatus,
    isVehicleActivated:
      !!user.Vehicle && Array.isArray(user.Vehicle) && user.Vehicle.length > 0,
  };
}
