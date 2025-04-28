import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IBookingsRepository } from './bookings.repository';
import { CreateBookingDto } from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';
import { BookingEntity } from '../entities/booking.entity';
import { BookingStatus } from './interfaces/booking-status.interface';
import { BookingStatusLogEntity } from '../entities/booking.status.log.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Decimal from 'decimal.js';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingRepository: IBookingsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createBooking(userId: number, createBookingDto: CreateBookingDto) {
    const { vehicleId, slotId, scheduledEntry, scheduledExit, promoCodeId } =
      createBookingDto;

    await this.validateSlotAvailability(slotId, scheduledEntry, scheduledExit);

    const bookingReference = `SPB-${uuidv4().substring(0, 8).toUpperCase()}`;

    const estimatedPrice = 50000;

    const newBookingEntity: BookingEntity = new BookingEntity({
      userId,
      vehicleId,
      slotId,
      promoCodeId,
      bookingReference,
      scheduledEntry: new Date(scheduledEntry),
      scheduledExit: new Date(scheduledExit),
      bookingStatus: BookingStatus.PENDING,
      estimatedPrice: Decimal(estimatedPrice),
    });

    const bookingEntity =
      await this.bookingRepository.createBookingsRepository(newBookingEntity);

    const newBookingStatusLog = new BookingStatusLogEntity({
      bookingId: bookingEntity.id,
      previousStatus: 'none',
      newStatus: BookingStatus.PENDING,
      changedBy: `user:${userId}`,
    });

    await this.bookingRepository.createBookingStatusLogRepository(
      newBookingStatusLog,
    );

    return bookingEntity;
  }

  private async validateSlotAvailability(
    slotId: number,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const slotAvailability =
      await this.bookingRepository.validateSlotAvailabilityRepository(slotId);

    if (!slotAvailability) {
      throw new NotFoundException('Slot parkir tidak ditemukan');
    }

    if (!slotAvailability.isActive) {
      throw new BadRequestException('Slot parkir tidak aktif');
    }

    if (slotAvailability.isReserved || slotAvailability.isOccupied) {
      throw new ConflictException(
        'Slot parkir sudah direservasi atau sedang digunakan',
      );
    }

    const conflictingBooking =
      await this.bookingRepository.conflictingBookingRepository(
        slotId,
        startTime,
        endTime,
      );

    if (conflictingBooking) {
      throw new ConflictException(
        'Slot parkir sudah dibooking untuk periode waktu yang diminta',
      );
    }
  }
}
