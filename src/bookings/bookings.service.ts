import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IBookingsRepository } from './bookings.repository';
import {
  CreateBookingDto,
  CreateBookingResponseDto,
} from './dto/create-booking.dto';
import { v4 as uuidv4 } from 'uuid';
import { BookingEntity } from '../entities/booking.entity';
import { BookingStatus } from './interfaces/booking-status.interface';
import { BookingStatusLogEntity } from '../entities/booking.status.log.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Decimal from 'decimal.js';
import { PrismaService } from '../prisma/prisma.service';
import { TariffRateEntity } from '../entities/tariff.rate.entity';
import { SlotAvailabilityEntity } from '../entities/slot.availability.entity';
import { PrismaClient } from 'generated/prisma';
import { DateUtil } from '../common/utils/date.util';
import { GeneratorsService } from '../common/utils/generators';
import { BookingResponseDto } from './dto/booking-response.dto';

@Injectable()
export class BookingsService {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingRepository: IBookingsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly generatorsService: GeneratorsService,
  ) {}

  async createBookingService(
    user: any,
    createBookingDto: CreateBookingDto,
  ): Promise<CreateBookingResponseDto> {
    const {
      vehicleId,
      placeId,
      slotId,
      scheduledEntry,
      scheduledExit,
      promoCodeId,
    } = createBookingDto;

    await this.validateSlotAvailability(slotId, scheduledEntry, scheduledExit);

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<BookingEntity> => {
        const userVehicle =
          await this.bookingRepository.getUserVehicleRepository(
            user,
            vehicleId,
          );

        this.logger.debug('userVehicle', userVehicle);

        if (!userVehicle) {
          throw new NotFoundException('kendaraan tidak ditemukan');
        }

        const parkingSlot =
          await this.bookingRepository.getParkingSlotByIdRepository(slotId);

        if (!parkingSlot) {
          throw new NotFoundException('slot parkir tidak ditemukan');
        }

        const estimatedPrice = await this.calculateParkingFee(
          placeId,
          userVehicle.vehicleType,
          parkingSlot.slotType,
          new Date(scheduledEntry),
          new Date(scheduledExit),
          promoCodeId,
        );

        this.logger.debug('estimated price', estimatedPrice);

        const bookingReference = `SPB-${uuidv4().substring(0, 8).toUpperCase()}`;

        console.log(DateUtil.nowLocal());

        const newBookingEntity: BookingEntity = new BookingEntity({
          id: 0,
          userId: user.id,
          vehicleId,
          slotId,
          promoCodeId,
          bookingReference,
          scheduledEntry: new Date(scheduledEntry),
          scheduledExit: new Date(scheduledExit),
          bookingStatus: BookingStatus.PENDING,
          estimatedPrice: Decimal(estimatedPrice),
          bookingTime: DateUtil.nowLocal(),
          createdAt: DateUtil.nowLocal(),
          actualEntry: null,
          actualExit: null,
          cancellationReason: null,
          cancellationTimeMinutes: null,
          finalPrice: null,
          qrCode: null,
          updatedAt: DateUtil.nowLocal(),
          Slot: null,
          Place: null,
          Vehicle: null,
        });

        this.logger.debug('booking entity', newBookingEntity);

        const bookingEntity =
          await this.bookingRepository.createBookingsRepository(
            prisma,
            newBookingEntity,
          );

        await this.bookingRepository.updateParkingSlotIsReservedRepository(
          prisma,
          bookingEntity,
        );

        const newSlotAvailability = new SlotAvailabilityEntity({
          slotId: bookingEntity.slotId,
          availableFrom: bookingEntity.scheduledEntry,
          availableUntil: bookingEntity.scheduledExit,
          isBookable: false,
          statusReason: `Booked by ${bookingEntity.bookingReference}`,
        });

        await this.bookingRepository.createSlotAvailabilityRepository(
          prisma,
          newSlotAvailability,
        );

        if (promoCodeId) {
          await this.bookingRepository.updatePromoCodeRepository(promoCodeId);
        }

        const newBookingStatusLog = new BookingStatusLogEntity({
          bookingId: bookingEntity.id,
          previousStatus: 'NONE',
          newStatus: BookingStatus.PENDING,
          changedBy: `user:${user.id}`,
          reason: `Booked by ${bookingEntity.bookingReference}`,
        });

        await this.bookingRepository.createBookingStatusLogRepository(
          prisma,
          newBookingStatusLog,
        );

        return bookingEntity;
      },
    );

    return {
      id: result.id,
      bookingReference: result.bookingReference,
    };
  }

  async getBookingService(user: any, id: number): Promise<BookingResponseDto> {
    const bookingEntity = await this.bookingRepository.getBookingRepository(
      user,
      id,
    );

    if (!bookingEntity) {
      throw new NotFoundException('booking parkir tidak ditemukan');
    }

    const userProfileEntity =
      await this.bookingRepository.getUserProfileRepository(user);

    if (!userProfileEntity) {
      throw new NotFoundException('user profile tidak ditemukan');
    }

    return {
      id: bookingEntity.id,
      qrCode: bookingEntity.qrCode ?? '',
      bookingReference: bookingEntity.bookingReference,
      address: bookingEntity.Place?.address ?? '',
      endTime: bookingEntity.scheduledExit,
      adminFee: 0,
      discount: 0,
      estimatedPrice: Number(bookingEntity.estimatedPrice),
      licencePlate: bookingEntity.Vehicle?.licensePlate ?? '',
      vehicle: bookingEntity.Vehicle?.vehicleType ?? '',
      location: bookingEntity.Place?.name ?? '',
      name: `${userProfileEntity.firstName} ${userProfileEntity.lastName}`,
      phone: `${user.phoneNumber}`,
      payment: bookingEntity.bookingStatus,
      slotNumber: bookingEntity.Slot?.slotNumber ?? '',
      startTime: bookingEntity.scheduledEntry,
      status: bookingEntity.bookingStatus,
    };
  }

  async generateQRCode(bookingId: number) {
    const bookingEntity =
      await this.bookingRepository.getBookingByIdRepository(bookingId);

    if (!bookingEntity) {
      throw new NotFoundException('booking parkir tidak ditemukan');
    }

    bookingEntity.qrCode = await this.generatorsService.generateQRCode(
      bookingEntity.bookingReference,
    );

    await this.bookingRepository.updateBookingQRCodeRepository(bookingEntity);
  }

  private async calculateParkingFee(
    placeId: number,
    vehicleType: string,
    slotType: string,
    startTime: Date,
    endTime: Date,
    promoCodeId: any,
  ): Promise<any> {
    this.logger.debug('process calculate fee parking running');
    const tariffPlan = await this.bookingRepository.getTariffPlanRepository(
      placeId,
      startTime,
      endTime,
      vehicleType,
      slotType,
    );

    this.logger.debug('tariffPlan', tariffPlan);

    if (!tariffPlan || tariffPlan.TariffRate.length === 0) {
      throw new NotFoundException(
        `Tarif tidak ditemukan untuk kombinasi kendaraan ${vehicleType} dan slot ${slotType}`,
      );
    }

    // 2. Tentukan kategori hari (WEEKDAY/WEEKEND)
    const startDay = startTime.getDay();
    const dayCategory =
      startDay === 0 || startDay === 6 ? 'WEEKEND' : 'WEEKDAY';

    this.logger.debug(`startDay ${startDay} | dayCategory ${dayCategory}`);

    // 3. Cari tariff rate yang sesuai dengan kategori hari dan waktu
    let applicableRate: TariffRateEntity | null = null;

    this.logger.debug('applicable rate');

    applicableRate =
      tariffPlan.TariffRate.find((rate) => {
        // Jika rate memiliki kategori hari yang cocok
        if (rate.dayCategory === dayCategory) {
          // Jika rate memiliki waktu spesifik
          if (rate.startTime && rate.endTime) {
            const startHour = startTime.getHours();
            const startMinutes = startTime.getMinutes();

            // Konversi ke objek Date untuk memudahkan perbandingan
            const rateStartTime = DateUtil.nowLocal();
            rateStartTime.setHours(
              rate.startTime.getHours(),
              rate.startTime.getMinutes(),
              0,
              0,
            );

            const rateEndTime = DateUtil.nowLocal();
            rateEndTime.setHours(
              rate.endTime.getHours(),
              rate.endTime.getMinutes(),
              0,
              0,
            );

            const currentTimeOfDay = DateUtil.nowLocal();
            currentTimeOfDay.setHours(startHour, startMinutes, 0, 0);

            // Handle kasus dimana endTime lebih kecil dari startTime (misalnya 23:00 - 06:00)
            if (rateEndTime < rateStartTime) {
              return (
                currentTimeOfDay >= rateStartTime ||
                currentTimeOfDay < rateEndTime
              );
            } else {
              return (
                currentTimeOfDay >= rateStartTime &&
                currentTimeOfDay < rateEndTime
              );
            }
          }
          // Jika tidak memiliki waktu spesifik, gunakan rate untuk seluruh hari
          return true;
        }
        return false;
      }) ?? null;

    if (!applicableRate) {
      applicableRate =
        tariffPlan.TariffRate.find((rate) => !rate.dayCategory) ?? null;
    }

    // Jika masih tidak menemukan, gunakan rate pertama
    if (!applicableRate) {
      applicableRate = tariffPlan.TariffRate[0];
    }

    // 4. Hitung durasi parkir dalam jam (pembulatan ke atas)
    const durationMs =
      new Date(endTime).getTime() - new Date(startTime).getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    let totalFee = Number(applicableRate.minimumCharge);

    // 6. Tambahkan biaya per jam untuk durasi lebih dari jam pertama
    if (durationHours > 1) {
      const additionalHours = durationHours - 1;
      totalFee += additionalHours * Number(applicableRate.hourlyRate);
    }

    // 7. Periksa apakah tarif harian lebih murah dan dapat diterapkan
    if (applicableRate.dayRate && durationHours >= 6) {
      const daysCount = Math.ceil(durationHours / 24);
      const dayRateTotal = daysCount * Number(applicableRate.dayRate);

      // Gunakan tarif yang lebih murah
      totalFee = Math.min(totalFee, dayRateTotal);
    }

    this.logger.debug(`total fees ${totalFee}`);

    // 8. Terapkan biaya minimum jika perlu
    totalFee = Math.max(totalFee, Number(applicableRate.minimumCharge));

    // 9. Terapkan kode promo jika ada
    if (promoCodeId) {
      const promoDiscount = await this.applyPromoCode(promoCodeId, totalFee);
      totalFee -= promoDiscount;
    }

    // Pastikan tidak kurang dari 0
    return Math.max(0, totalFee);
  }

  private async applyPromoCode(
    promoCodeId: number,
    amount: number,
  ): Promise<number> {
    const promoCode =
      await this.bookingRepository.getPromoCodeRepository(promoCodeId);

    if (!promoCode) {
      return 0;
    }

    if (amount < promoCode.minimumSpend.toNumber()) {
      return 0;
    }

    // Hitung diskon
    let discountAmount = 0;

    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = (amount * Number(promoCode.discountValue)) / 100;
    } else if (promoCode.discountType === 'FIXED') {
      discountAmount = Number(promoCode.discountValue);
    }

    // Pastikan diskon tidak lebih besar dari jumlah
    return Math.min(discountAmount, amount);
  }

  private async validateSlotAvailability(
    slotId: number,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const slotAvailability =
      await this.bookingRepository.validateSlotAvailabilityRepository(slotId);

    this.logger.debug('Slot Availability', slotAvailability);

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

    this.logger.debug('ConflictingBooking', conflictingBooking);

    if (conflictingBooking) {
      throw new ConflictException(
        'Slot parkir sudah dibooking untuk periode waktu yang diminta',
      );
    }
  }
}
