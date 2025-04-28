import { ApiProperty } from '@nestjs/swagger';
import { VehicleEntity } from '../../entities/vehicle.entity';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateVehicleRequestDto {
  @ApiProperty({ example: 'B1234XYZ' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ example: 'car' })
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty({ example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'Avanza', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 'Silver', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'RFID123456', required: false })
  @IsOptional()
  @IsString()
  rfidTag?: string;

  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  length?: number;

  @ApiProperty({ example: 1.75, required: false })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiProperty({ example: 1.6, required: false })
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class VehicleResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'B1234XYZ' })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ example: 'car' })
  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @ApiProperty({ example: 'Toyota', required: false })
  @IsOptional()
  @IsString()
  brand: string | null;

  @ApiProperty({ example: 'Avanza', required: false })
  @IsOptional()
  @IsString()
  model: string | null;

  @ApiProperty({ example: 'Silver', required: false })
  @IsOptional()
  @IsString()
  color: string | null;

  @ApiProperty({ example: 'RFID123456', required: false })
  @IsOptional()
  @IsString()
  rfidTag: string | null;

  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  length: number | null;

  @ApiProperty({ example: 1.75, required: false })
  @IsOptional()
  @IsNumber()
  width: number | null;

  @ApiProperty({ example: 1.6, required: false })
  @IsOptional()
  @IsNumber()
  height: number | null;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean | null;

  @ApiProperty({ example: '2025-04-14T12:00:00Z' })
  @IsDateString()
  createdAt: Date | null;

  @ApiProperty({ example: '2025-04-15T10:30:00Z', required: false })
  @IsOptional()
  @IsDateString()
  updatedAt: Date | null;
}

export function mapToVehicleResponseDto(
  vehicle: VehicleEntity,
): VehicleResponseDto {
  return {
    id: vehicle.id ?? 0,
    licensePlate: vehicle.licensePlate,
    vehicleType: vehicle.vehicleType,
    brand: vehicle.brand ?? null,
    model: vehicle.model ?? null,
    color: vehicle.color ?? null,
    rfidTag: vehicle.rfidTag ?? null,
    length: vehicle.length ?? null,
    width: vehicle.width ?? null,
    height: vehicle.height ?? null,
    isActive: vehicle.isActive,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt ?? null,
  };
}
