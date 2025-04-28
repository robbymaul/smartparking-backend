import { Vehicle } from '../../generated/prisma';

export class VehicleEntity {
  id?: number;
  userId: number;
  licensePlate: string;
  vehicleType: string;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  rfidTag?: string | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  constructor(params: VehicleEntity) {
    Object.assign(this, params);
  }
}

export function mapToVehicleEntity(vehicle: Vehicle): VehicleEntity {
  return new VehicleEntity({
    id: vehicle.id,
    userId: vehicle.userId,
    licensePlate: vehicle.licensePlate,
    vehicleType: vehicle.vehicleType,
    brand: vehicle.brand,
    model: vehicle.model,
    color: vehicle.color,
    rfidTag: vehicle.rfidTag,
    length: vehicle.length?.toNumber?.() ?? null, // Decimal => number
    width: vehicle.width?.toNumber?.() ?? null,
    height: vehicle.height?.toNumber?.() ?? null,
    isActive: vehicle.isActive,
    createdAt: vehicle.createdAt,
    updatedAt: vehicle.updatedAt ?? null,
  });
}
