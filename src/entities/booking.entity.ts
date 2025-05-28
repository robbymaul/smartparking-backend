import Decimal from 'decimal.js';
import { Booking, ParkingSlot, Place, Vehicle } from '../../generated/prisma';
import { mapToPlaceEntity, PlaceEntity } from './places.entity';
import { mapToVehicleEntity, VehicleEntity } from './vehicle.entity';
import {
  mapToParkingSlotEntity,
  ParkingSlotEntity,
} from './parking.slot.entity';

export class BookingEntity {
  id: number;
  userId: number;
  vehicleId: number;
  slotId: number;
  promoCodeId: number | null;
  bookingReference: string;
  bookingTime: Date;
  scheduledEntry: Date;
  scheduledExit: Date;
  actualEntry: Date | null;
  actualExit: Date | null;
  qrCode: string | null;
  bookingStatus: string;
  estimatedPrice: Decimal; // Gunakan `Decimal.js` jika ingin support lebih baik
  finalPrice: Decimal | null;
  cancellationReason: string | null;
  cancellationTimeMinutes: number | null;
  createdAt: Date;
  updatedAt?: Date | null;
  Place: PlaceEntity | null;
  Vehicle: VehicleEntity | null;
  Slot: ParkingSlotEntity | null;

  constructor(params: BookingEntity) {
    Object.assign(this, params);
  }
}

export function mapToBookingEntity(param: {
  booking: Booking;
  place?: Place;
  vehicle?: Vehicle;
  slot?: ParkingSlot;
}): BookingEntity {
  const { booking } = param;

  return {
    id: booking.id,
    userId: booking.userId,
    vehicleId: booking.vehicleId,
    slotId: booking.slotId,
    promoCodeId: booking.promoCodeId,
    bookingReference: booking.bookingReference,
    bookingTime: booking.bookingTime,
    scheduledEntry: booking.scheduledEntry,
    scheduledExit: booking.scheduledExit,
    actualEntry: booking.actualEntry ? booking.actualEntry : null,
    actualExit: booking.actualExit ? booking.actualExit : null,
    qrCode: booking.qrCode,
    bookingStatus: booking.bookingStatus,
    estimatedPrice: booking.estimatedPrice,
    finalPrice: booking.finalPrice,
    cancellationReason: booking.cancellationReason,
    cancellationTimeMinutes: booking.cancellationTimeMinutes,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt ? booking.updatedAt : null,
    Place: param.place ? mapToPlaceEntity(param.place) : null,
    Vehicle: param.vehicle ? mapToVehicleEntity(param.vehicle) : null,
    Slot: param.slot ? mapToParkingSlotEntity({ slot: param.slot }) : null,
  };
}
