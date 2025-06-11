import { PlaceAdminEntity } from '../../entities/place.admin.entity';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoleAdmin } from '../enum/role.enum';

export class AdminResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(RoleAdmin)
  role: RoleAdmin;

  @IsOptional()
  @IsString()
  contactNumber: string;

  @IsBoolean()
  isActive: boolean;

  createdAt: Date;
}

export function mapToAdminResponseDto(
  placeAdmin: PlaceAdminEntity,
): AdminResponseDto {
  let role: RoleAdmin;
  switch (placeAdmin.role) {
    case RoleAdmin.ADMIN:
      role = RoleAdmin.ADMIN;
      break;
    case RoleAdmin.MASTER:
      role = RoleAdmin.MASTER;
      break;
    default:
      role = RoleAdmin.UNKNOWN;
  }
  return {
    contactNumber: placeAdmin.contactNumber || '',
    createdAt: placeAdmin.createdAt,
    email: placeAdmin.email,
    fullName: placeAdmin.fullName,
    id: placeAdmin.id,
    isActive: placeAdmin.isActive,
    role: role,
    username: placeAdmin.username,
  };
}
