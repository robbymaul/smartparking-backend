import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingEntity, mapToBookingEntity } from '../entities/booking.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import { BookingStatus } from './interfaces/booking-status.interface';
import {
  mapToParkingSlotEntity,
  ParkingSlotEntity,
} from '../entities/parking.slot.entity';
import { BookingStatusLogEntity } from '../entities/booking.status.log.entity';

export interface IBookingsRepository {
  createBookingsRepository(
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity>;

  validateSlotAvailabilityRepository(
    slotId: number,
  ): Promise<ParkingSlotEntity | null>;

  conflictingBookingRepository(
    slotId: number,
    startTime: string,
    endTime: string,
  ): Promise<BookingEntity | null>;

  createBookingStatusLogRepository(
    bookingStatusLogEntity: BookingStatusLogEntity,
  ): Promise<void>;
}

@Injectable()
export class BookingsRepository implements IBookingsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createBookingStatusLogRepository(
    bookingStatusLogEntity: BookingStatusLogEntity,
  ): Promise<void> {
    await this.prismaService.bookingStatusLog.create({
      data: {
        bookingId: bookingStatusLogEntity.bookingId,
        previousStatus: bookingStatusLogEntity.previousStatus,
        newStatus: bookingStatusLogEntity.newStatus,
        changedBy: bookingStatusLogEntity.changedBy,
      },
    });
    try {
    } catch (e) {
      this.logger.error(`create booking status log ${e}`);

      handlePrismaError(e, 'create booking status log');
    }
  }

  async conflictingBookingRepository(
    slotId: number,
    startTime: string,
    endTime: string,
  ): Promise<BookingEntity | null> {
    try {
      const conflictingBooking = await this.prismaService.booking.findFirst({
        where: {
          slotId,
          bookingStatus: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.CONFIRMED,
              BookingStatus.ACTIVE,
            ],
          },
          OR: [
            {
              // Booking lain yang tumpang tindih dengan periode yang diminta
              AND: [
                { scheduledEntry: { lte: new Date(endTime) } },
                { scheduledExit: { gte: new Date(startTime) } },
              ],
            },
          ],
        },
      });

      return conflictingBooking
        ? mapToBookingEntity({ booking: conflictingBooking })
        : null;
    } catch (e) {
      this.logger.error(`conflicting booking repository ${e}`);

      handlePrismaError(e, 'conflicting booking repository');
    }
  }

  async validateSlotAvailabilityRepository(
    slotId: number,
  ): Promise<ParkingSlotEntity | null> {
    try {
      const slot = await this.prismaService.parkingSlot.findUnique({
        where: { id: slotId },
      });

      return slot ? mapToParkingSlotEntity({ parkingSlot: slot }) : null;
    } catch (e) {
      this.logger.error(`validate slot availability repository ${e}`);

      handlePrismaError(e, 'validate slot availability repository');
    }
  }

  async createBookingsRepository(
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity> {
    try {
      const booking = await this.prismaService.booking.create({
        data: {
          userId: bookingEntity.userId,
          vehicleId: bookingEntity.vehicleId,
          slotId: bookingEntity.slotId,
          promoCodeId: bookingEntity.promoCodeId,
          bookingReference: bookingEntity.bookingReference,
          scheduledEntry: new Date(bookingEntity.scheduledEntry),
          scheduledExit: new Date(bookingEntity.scheduledExit),
          bookingStatus: BookingStatus.PENDING,
          estimatedPrice: bookingEntity.estimatedPrice,
        },
      });

      return mapToBookingEntity({ booking: booking });
    } catch (e) {
      this.logger.error(`create booking repository ${e}`);

      handlePrismaError(e, 'create booking repository');
    }
  }
}
