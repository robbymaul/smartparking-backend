import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { UserProfileEntity } from '../../entities/user.profile.entity';
import { Type } from 'class-transformer';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'Robby', required: false })
  @IsOptional()
  @IsString()
  firstName: string | null;

  @ApiProperty({ example: 'Maulana', required: false })
  @IsOptional()
  @IsString()
  lastName: string | null;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  profilePhoto: string | null;

  @ApiProperty({ example: 'male', required: false })
  @IsOptional()
  @IsString()
  gender: string | null;

  @ApiProperty({ example: '1995-08-15T00:00:00Z', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth: Date | null;

  @ApiProperty({ example: 'Jl. Mawar No. 123', required: false })
  @IsOptional()
  @IsString()
  address: string | null;

  @ApiProperty({ example: 'Jakarta', required: false })
  @IsOptional()
  @IsString()
  city: string | null;

  @ApiProperty({ example: 'DKI Jakarta', required: false })
  @IsOptional()
  @IsString()
  state: string | null;

  @ApiProperty({ example: '12345', required: false })
  @IsOptional()
  @IsString()
  postalCode: string | null;

  @ApiProperty({ example: 'Indonesia', required: false })
  @IsOptional()
  @IsString()
  country: string | null;
}

export function mapToUserProfileResponseToDto(
  profile: UserProfileEntity,
): UserProfileResponseDto {
  return {
    firstName: profile.firstName ?? null,
    lastName: profile.lastName ?? null,
    profilePhoto: profile.profilePhoto ?? null,
    gender: profile.gender ?? null,
    dateOfBirth: profile.dateOfBirth ?? null,
    address: profile.address ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    postalCode: profile.postalCode ?? null,
    country: profile.country ?? null,
  };
}
