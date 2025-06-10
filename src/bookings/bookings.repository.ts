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
import { mapToVehicleEntity, VehicleEntity } from '../entities/vehicle.entity';
import {
  mapToTariffPlanEntity,
  TariffPlanEntity,
} from '../entities/tariff.plan.entity';
import {
  mapToPromoCodeEntity,
  PromoCodeEntity,
} from '../entities/promo.code.entity';
import { SlotAvailabilityEntity } from '../entities/slot.availability.entity';
import {
  mapToUserProfileEntity,
  UserProfileEntity,
} from '../entities/user.profile.entity';
import { PrismaClient } from 'generated/prisma';

export interface IBookingsRepository {
  createBookingsRepository(
    prisma: PrismaClient,
    newBookingEntity: BookingEntity,
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
    prisma: PrismaClient,
    bookingStatusLogEntity: BookingStatusLogEntity,
  ): Promise<void>;

  getUserVehicleRepository(
    user: any,
    vehicleId: number,
  ): Promise<VehicleEntity | null>;

  getParkingSlotByIdRepository(
    slotId: number,
  ): Promise<ParkingSlotEntity | null>;

  getTariffPlanRepository(
    placeId: number,
    startTime: Date,
    endTime: Date,
    vehicleType: string,
    slotType: string,
  ): Promise<TariffPlanEntity | null>;

  getPromoCodeRepository(promoCodeId: number): Promise<PromoCodeEntity | null>;

  createSlotAvailabilityRepository(
    prisma: PrismaClient,
    newSlotAvailability: SlotAvailabilityEntity,
  ): Promise<void>;

  updatePromoCodeRepository(promoCodeId: number): Promise<void>;

  getBookingRepository(user: any, id: number): Promise<BookingEntity | null>;

  getUserProfileRepository(user: any): Promise<UserProfileEntity | null>;

  getBookingByIdRepository(bookingId: number): Promise<BookingEntity | null>;

  updateBookingQRCodeRepository(bookingEntity: BookingEntity): Promise<void>;

  updateParkingSlotIsReservedRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<void>;
}

@Injectable()
export class BookingsRepository implements IBookingsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async updateParkingSlotIsReservedRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<void> {
    try {
      await prisma.parkingSlot.update({
        where: { id: bookingEntity.slotId },
        data: {
          isReserved: true,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update parking slot is reserved repository ${e}`);

      handlePrismaError(e, 'update parking slot is reserved repository ');
    }
  }

  async updateBookingQRCodeRepository(
    bookingEntity: BookingEntity,
  ): Promise<void> {
    try {
      await this.prismaService.booking.update({
        where: { id: bookingEntity.id },
        data: {
          qrCode: bookingEntity.qrCode,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update booking qr code repository ${e}`);

      handlePrismaError(e, 'update booking qr code repository ');
    }
  }

  async getBookingByIdRepository(
    bookingId: number,
  ): Promise<BookingEntity | null> {
    try {
      const booking = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
        include: {
          parkingSlot: {
            include: {
              parkingZone: {
                include: {
                  place: true,
                },
              },
            },
          },
          vehicle: true,
        },
      });

      return booking
        ? mapToBookingEntity({
            booking: booking,
            place: booking.parkingSlot?.parkingZone?.place,
            vehicle: booking.vehicle,
            slot: booking.parkingSlot,
          })
        : null;
    } catch (e) {
      this.logger.error(`get booking by id repository ${e}`);

      handlePrismaError(e, 'get booking by id repository ');
    }
  }

  async getUserProfileRepository(user: any): Promise<UserProfileEntity | null> {
    try {
      const userProfile = await this.prismaService.userProfile.findUnique({
        where: { userId: user.id },
      });

      return userProfile
        ? mapToUserProfileEntity({ profile: userProfile })
        : null;
    } catch (e) {
      this.logger.error(`get user profile repository ${e}`);

      handlePrismaError(e, 'get user profile repository ');
    }
  }

  async getBookingRepository(
    user: any,
    id: number,
  ): Promise<BookingEntity | null> {
    try {
      const booking = await this.prismaService.booking.findFirst({
        where: { id: id, userId: user.id },
        include: {
          parkingSlot: {
            include: {
              parkingZone: {
                include: {
                  place: true,
                },
              },
            },
          },
          vehicle: true,
        },
      });

      return booking
        ? mapToBookingEntity({
            booking: booking,
            place: booking.parkingSlot?.parkingZone?.place,
            vehicle: booking.vehicle,
            slot: booking.parkingSlot,
          })
        : null;
    } catch (e) {
      this.logger.error(`get booking repository ${e}`);

      handlePrismaError(e, 'get booking repository ');
    }
  }

  async updatePromoCodeRepository(promoCodeId: number): Promise<void> {
    try {
      await this.prismaService.promoCode.update({
        where: { id: promoCodeId },
        data: { usageCount: { increment: 1 } },
      });
    } catch (e) {
      this.logger.error(`update promo code repository ${e}`);

      handlePrismaError(e, 'update promo code repository ');
    }
  }

  async createSlotAvailabilityRepository(
    prisma: PrismaClient,
    newSlotAvailability: SlotAvailabilityEntity,
  ): Promise<void> {
    try {
      await prisma.slotAvailability.create({
        data: {
          slotId: newSlotAvailability.slotId,
          availableFrom: new Date(newSlotAvailability.availableFrom),
          availableUntil: new Date(newSlotAvailability.availableUntil),
          isBookable: false,
          statusReason: newSlotAvailability.statusReason,
        },
      });
    } catch (e) {
      this.logger.error(`create slot availability repository ${e}`);

      handlePrismaError(e, 'create slot availability repository ');
    }
  }

  async getPromoCodeRepository(
    promoCodeId: number,
  ): Promise<PromoCodeEntity | null> {
    try {
      const promoCode = await this.prismaService.promoCode.findUnique({
        where: {
          id: promoCodeId,
          isActive: true,
          validFrom: { lte: new Date() },
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });

      return promoCode ? mapToPromoCodeEntity(promoCode) : null;
    } catch (e) {
      this.logger.error(`get promo code repository ${e}`);

      handlePrismaError(e, 'get promo code by id repository ');
    }
  }

  async getTariffPlanRepository(
    placeId: number,
    startTime: Date,
    endTime: Date,
    vehicleType: string,
    slotType: string,
  ): Promise<TariffPlanEntity | null> {
    try {
      this.logger.debug(
        `vehicle type = ${vehicleType} and slot type = ${slotType}`,
      );
      const tariffPlan = await this.prismaService.tariffPlan.findFirst({
        where: {
          placeId,
          isActive: true,
          effectiveFrom: { lte: startTime },
          OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: endTime } }],
        },
        include: {
          tariffRates: {
            where: {
              vehicleType: {
                equals: 'Car',
                mode: 'insensitive',
              },
              slotType: {
                equals: 'Regular',
                mode: 'insensitive',
              },
              // vehicleType: {
              //   equals: vehicleType,
              //   mode: 'insensitive', // ← ini membuatnya tidak case-sensitive
              // },
              // slotType: {
              //   equals: slotType,
              //   mode: 'insensitive',
              // },
            },
          },
        },
      });

      return tariffPlan ? mapToTariffPlanEntity(tariffPlan) : null;
    } catch (e) {
      this.logger.error(`get tariff plan repository ${e}`);

      handlePrismaError(e, 'get tariff plan by id repository ');
    }
  }

  async getParkingSlotByIdRepository(
    slotId: number,
  ): Promise<ParkingSlotEntity | null> {
    try {
      const parkingSlot = await this.prismaService.parkingSlot.findUnique({
        where: {
          id: slotId,
        },
      });

      return parkingSlot ? mapToParkingSlotEntity({ slot: parkingSlot }) : null;
    } catch (e) {
      this.logger.error(`get parking slot by id repository ${e}`);

      handlePrismaError(e, 'get parking slot by id repository ');
    }
  }

  async getUserVehicleRepository(
    user: any,
    vehicleId: number,
  ): Promise<VehicleEntity | null> {
    try {
      const vehicle = await this.prismaService.vehicle.findUnique({
        where: {
          id: vehicleId,
          userId: user.id,
        },
      });

      return vehicle ? mapToVehicleEntity(vehicle) : null;
    } catch (e) {
      this.logger.error(`get vehicle by id and user id repository ${e}`);

      handlePrismaError(e, 'get vehicle by id and user id repository ');
    }
  }

  async createBookingStatusLogRepository(
    prisma: PrismaClient,
    bookingStatusLogEntity: BookingStatusLogEntity,
  ): Promise<void> {
    try {
      await prisma.bookingStatusLog.create({
        data: {
          bookingId: bookingStatusLogEntity.bookingId,
          previousStatus: bookingStatusLogEntity.previousStatus,
          newStatus: bookingStatusLogEntity.newStatus,
          changedBy: bookingStatusLogEntity.changedBy,
        },
      });
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

      return slot ? mapToParkingSlotEntity({ slot: slot }) : null;
    } catch (e) {
      this.logger.error(`validate slot availability repository ${e}`);

      handlePrismaError(e, 'validate slot availability repository');
    }
  }

  async createBookingsRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity> {
    try {
      const booking = await prisma.booking.create({
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
