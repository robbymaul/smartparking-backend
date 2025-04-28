import Decimal from 'decimal.js';
import { Booking } from '../../generated/prisma';

export class BookingEntity {
  id: number;
  userId: number;
  vehicleId: number;
  slotId: number;
  promoCodeId?: number | null;
  bookingReference: string;
  bookingTime: Date;
  scheduledEntry: Date;
  scheduledExit: Date;
  actualEntry?: Date | null;
  actualExit?: Date | null;
  qrCode?: string | null;
  bookingStatus: string;
  estimatedPrice: Decimal; // Gunakan `Decimal.js` jika ingin support lebih baik
  finalPrice?: Decimal | null;
  cancellationReason?: string | null;
  cancellationTimeMinutes?: number | null;
  createdAt: Date;
  updatedAt?: Date | null;

  constructor(param: {
    userId: number;
    vehicleId: number;
    slotId: number;
    promoCodeId?: number | null;
    bookingReference: string;
    scheduledEntry: Date;
    scheduledExit: Date;
    bookingStatus: string;
    estimatedPrice: Decimal;
    actualEntry?: Date | null;
    actualExit?: Date | null;
    qrCode?: string | null;
    finalPrice?: Decimal | null;
    cancellationReason?: string | null;
    cancellationTimeMinutes?: number | null;
  }) {
    this.userId = param.userId;
    this.vehicleId = param.vehicleId;
    this.slotId = param.slotId;
    this.promoCodeId = param.promoCodeId;
    this.bookingReference = param.bookingReference;
    this.scheduledEntry = param.scheduledEntry;
    this.scheduledExit = param.scheduledExit;
    this.bookingStatus = param.bookingStatus;
    this.estimatedPrice = param.estimatedPrice;
    this.actualEntry = param.actualEntry;
    this.actualExit = param.actualExit;
    this.qrCode = param.qrCode;
    this.finalPrice = param.finalPrice;
    this.cancellationReason = param.cancellationReason;
    this.cancellationTimeMinutes = param.cancellationTimeMinutes;

    // Properti lainnya
    this.bookingTime = new Date(); // Biasanya waktu sekarang saat booking dibuat
    this.createdAt = new Date(); // Waktu sekarang saat entri dibuat
    this.updatedAt = new Date(); // Atau `new Date()` jika perlu
  }
}

export function mapToBookingEntity(param: { booking: Booking }): BookingEntity {
  const { booking } = param;

  return {
    id: booking.id,
    userId: booking.userId,
    vehicleId: booking.vehicleId,
    slotId: booking.slotId,
    promoCodeId: booking.promoCodeId ?? undefined,
    bookingReference: booking.bookingReference,
    bookingTime: new Date(booking.bookingTime),
    scheduledEntry: new Date(booking.scheduledEntry),
    scheduledExit: new Date(booking.scheduledExit),
    actualEntry: booking.actualEntry
      ? new Date(booking.actualEntry)
      : undefined,
    actualExit: booking.actualExit ? new Date(booking.actualExit) : undefined,
    qrCode: booking.qrCode ?? undefined,
    bookingStatus: booking.bookingStatus,
    estimatedPrice: booking.estimatedPrice,
    finalPrice: booking.finalPrice ?? undefined,
    cancellationReason: booking.cancellationReason ?? undefined,
    cancellationTimeMinutes: booking.cancellationTimeMinutes ?? undefined,
    createdAt: new Date(booking.createdAt),
    updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : undefined,
  };
}
