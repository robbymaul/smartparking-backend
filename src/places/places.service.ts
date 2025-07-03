import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { IPlacesRepository } from './places.repository';
import {
  mapToPlaceResponseDto,
  PlaceResponseDto,
  RegisterPlacesRequestDto,
} from './dto/places.dto';
import { NearbyPlaceDto } from './dto/place.nearby.dto';
import {
  mapToPlacesRatingDtoResponse,
  PlacesRatingDtoResponse,
} from './dto/places.rating.dto';
import { mapToUserProfileResponseToDto } from '../users/dto/profile.dto';
import {
  mapToParkingZoneDtoResponse,
  ParkingZoneDtoResponse,
  ParkingZoneRequestDto,
} from './dto/parking.zone.dto';
import {
  BookingParkingSlotDtoResponse,
  DetailParkingSlotDtoResponse,
  mapToParkingSlotDtoResponse,
  ParkingSlotDtoResponse,
  ScanQrCodeDtoRequest,
} from './dto/parking.slot.dto';
import { NotificationResponseDto } from '../auth/dto/notification.dto';
import { PlaceEntity } from '../entities/places.entity';
import { PrismaClient } from 'generated/prisma';
import { PlaceAdminEntity } from 'src/entities/place.admin.entity';
import { GeneratorsService } from '../common/utils/generators';
import * as bcrypt from 'bcrypt';
import { NotificationService } from '../notification/notification.service';
import { SystemLogEntity } from '../entities/system.log.entity';
import { DayOfWeek, PlaceType } from '../common/enum/enum';
import {
  OperatingHourDtoResponse,
  OperatingHourRequestDto,
} from './dto/operating.hour.dto';
import { OperatingHourEntity } from '../entities/operating.hours.entity';
import { DateUtil } from '../common/utils/date.util';
import { ParkingZoneEntity } from '../entities/parking.zone.entity';
import { ParkingSlotEntity } from '../entities/parking.slot.entity';
import {
  mapToTariffPlanDtoResponse,
  TariffPlanDtoResponse,
  TariffPlanRequestDto,
} from './dto/tariff.plan.dto';
import { TariffPlanEntity } from '../entities/tariff.plan.entity';
import { TariffRateEntity } from '../entities/tariff.rate.entity';
import { BookingEntity } from '../entities/booking.entity';
import { BookingStatus } from '../bookings/interfaces/booking-status.interface';
import { AccessLogEntity } from '../entities/access.log.entity';
import { BookingStatusLogEntity } from '../entities/booking.status.log.entity';
import Decimal from 'decimal.js';

@Injectable()
export class PlacesService {
  constructor(
    @Inject('IPlacesRepository')
    private readonly placesRepository: IPlacesRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly generatorService: GeneratorsService,
    private readonly notificationService: NotificationService,
  ) {}

  async getPlacesService(
    user: any,
    page: number,
    limit: number,
    search?: string,
    city?: string,
    area?: string,
    type?: string,
  ): Promise<PlaceResponseDto[]> {
    const placesEntities = await this.placesRepository.getListPlacesRepository(
      page,
      limit,
      search,
      city,
      area,
      type,
    );

    return placesEntities.map((value) => mapToPlaceResponseDto(value));
  }

  async getDetailPlacesService(
    user: any,
    id: number,
  ): Promise<PlaceResponseDto> {
    const placesEntity = await this.placesRepository.getPlaceByIdRepository(id);

    if (!placesEntity) {
      throw new NotFoundException('Places tidak ditemukan');
    }

    if (!placesEntity.isActive) {
      throw new BadRequestException(
        `Places tidak aktif. Status: ${placesEntity.isActive}`,
      );
    }

    return mapToPlaceResponseDto(placesEntity);
  }

  async getPlacesNearbyService(
    user: any,
    nearbyPlaceDto: NearbyPlaceDto,
  ): Promise<PlaceResponseDto[]> {
    const placesEntities = await this.placesRepository.getPlaceNearbyRepository(
      nearbyPlaceDto.latitude,
      nearbyPlaceDto.longitude,
      nearbyPlaceDto.radius,
    );

    return placesEntities.map((value) => mapToPlaceResponseDto(value));
  }

  async getPlacesRatingService(
    user: any,
    id: number,
    page: number,
    limit: number,
  ): Promise<PlacesRatingDtoResponse[]> {
    const placesRatings =
      await this.placesRepository.getListPlacesRatingRepository(
        id,
        page,
        limit,
      );

    return placesRatings.map((value) =>
      mapToPlacesRatingDtoResponse({
        id: value.id,
        user: value.User ? mapToUserProfileResponseToDto(value.User) : null,
        ratingScore: value.ratingScore.toNumber(),
        reviewComment: value.reviewComment,
      }),
    );
  }

  async getParkingZoneService(
    user: any,
    placesId: number,
  ): Promise<ParkingZoneDtoResponse[]> {
    const parkingZones =
      await this.placesRepository.getListParkingZoneRepository(placesId);

    return parkingZones.map((value) => mapToParkingZoneDtoResponse(value));
  }

  async getParkingSlotService(
    user: any,
    zoneId: number,
  ): Promise<ParkingSlotDtoResponse[]> {
    const parkingZones =
      await this.placesRepository.getListParkingSlotRepository(zoneId);

    return parkingZones.map((value) => mapToParkingSlotDtoResponse(value));
  }

  async registerPlaces(
    request: RegisterPlacesRequestDto,
  ): Promise<NotificationResponseDto> {
    // open request
    const {
      name,
      placeType,
      address,
      latitude,
      longitude,
      contactNumber,
      email,
      description,
    } = request;

    const namePlace = await this.generatorService.capitalizeWords(name);

    // new place
    const newPlace: PlaceEntity = new PlaceEntity({
      name: namePlace,
      placeType,
      address,
      latitude,
      longitude,
      contactNumber,
      email,
      description,
      totalCapacity: 0,
      isActive: false,
    });

    // transactional
    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        const place: PlaceEntity =
          await this.placesRepository.insertPlaceRepository(prisma, newPlace);

        // create admin
        const adminName = `Admin ${place.name}`;
        const generatePasswordRandom =
          await this.generatorService.generateStrongPassword();
        const digitRandom = await this.generatorService.getRandom9Digits();
        const passwordHash = await bcrypt.hash(generatePasswordRandom, 10);

        const newPlaceAdmin: PlaceAdminEntity = new PlaceAdminEntity({
          id: 0,
          placeId: place.id,
          contactNumber: contactNumber,
          email: email,
          fullName: adminName,
          isActive: false,
          role: 'master',
          passwordHash: passwordHash,
          username: `admin${digitRandom}`,
        });

        const placeAdmin: PlaceAdminEntity =
          await this.placesRepository.insertPlaceAdminRepository(
            prisma,
            newPlaceAdmin,
          );

        // notification email
        await this.notificationService.sendRegisterInfoEmail(
          placeAdmin.username,
          placeAdmin.email,
          new Date().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          generatePasswordRandom,
        );

        // system log
        const newSystemLogEntity = new SystemLogEntity({
          entityType: 'place-admin',
          entityId: placeAdmin.id,
          action: 'register place and place admin',
          performedBy: `admin:${placeAdmin.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            ip: '127.0.0.1',
            userAgent: 'web',
            timeStamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.placesRepository.createSystemLogRepository(
          prisma,
          newSystemLogEntity,
        );

        return {
          success: true,
          message: `pendaftaran berhasil cek email anda ${placeAdmin.email}.`,
          email: placeAdmin.email,
          data: null,
        };
      },
    );

    // return
    return result;
  }

  async adminGetPlaceService(admin: any): Promise<PlaceResponseDto> {
    this.logger.debug(`admin ${JSON.stringify(admin)}`);
    // get place repository
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    // check if found
    if (!placeEntity) {
      throw new NotFoundException('place anda tidak ditemukan');
    }

    // map to place response dto
    return mapToPlaceResponseDto(placeEntity);
  }

  async adminUpdatePlaceService(
    admin: any,
    request: PlaceResponseDto,
  ): Promise<NotificationResponseDto> {
    // destruct request
    const {
      id,
      contactNumber,
      email,
      description,
      placeType,
      address,
      latitude,
      longitude,
      isActive,
      name,
      image,
      totalCapacity,
    } = request;

    // get place by admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException('Place anda tidak ditemukan');
    }

    // check request id === place id
    if (placeEntity.id !== id) {
      throw new ForbiddenException(`Data tidak bisa diubah`);
    }

    // updated place
    const updatePlaceEntity: PlaceEntity = this.updatePlaceEntity(
      contactNumber,
      email,
      description,
      latitude,
      longitude,
      isActive,
      name,
      image,
      placeType,
      address,
      totalCapacity,
      placeEntity,
    );

    // transactional
    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          // update place
          await this.placesRepository.updatePlaceRepository(
            prisma,
            updatePlaceEntity,
          );

          // system log
          const newSystemLogEntity = new SystemLogEntity({
            entityType: 'place',
            entityId: placeEntity.id ?? 0,
            action: 'update place by admin',
            performedBy: `admin:${admin.id}`,
            logLevel: 'info',
            logDetails: JSON.stringify({
              ip: '127.0.0.1',
              userAgent: 'web',
              timeStamp: new Date(),
              reason: `update place by ${admin.fullName}. | email: ${admin.email}`,
            }),
            logTime: new Date(),
            createdAt: new Date(),
          });

          await this.placesRepository.createSystemLogRepository(
            prisma,
            newSystemLogEntity,
          );

          // system log
          return {
            message: 'updated place successfully',
            success: true,
            data: null,
          };
        },
      );

    // return
    return result;
  }

  async adminCreatePlaceOperatingHourService(
    admin: any,
    request: OperatingHourRequestDto[],
  ): Promise<NotificationResponseDto> {
    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException('Place anda tidak ditemukan');
    }

    // init array operating hour entity
    const operatingHourEntity: OperatingHourEntity[] = [];

    // check day of week duplicate
    const dayOfWeekFilter = [
      ...new Map(
        request.map((dayOfWeek) => [dayOfWeek.dayOfWeek, dayOfWeek]),
      ).values(),
    ];

    if (dayOfWeekFilter.length < 7) {
      throw new BadRequestException('hari yang di tentukan harus 7 hari');
    }

    // sorted days of week
    const daysOrder: DayOfWeek[] = [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
      DayOfWeek.SUNDAY,
    ];

    const sortedOperatingHours = dayOfWeekFilter.sort(
      (a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek),
    );

    // push to array
    sortedOperatingHours.forEach((dayOfWeek) => {
      operatingHourEntity.push({
        dayOfWeek: dayOfWeek.dayOfWeek,
        is24Hours: dayOfWeek.is24Hours,
        isClosed: dayOfWeek.isClosed,
        placeId: placeEntity.id,
        closingTime: DateUtil.toISOTimeOnly(dayOfWeek.closingTime),
        openingTime: DateUtil.toISOTimeOnly(dayOfWeek.openingTime),
        id: 0,
      });
    });

    // transactional
    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          // insert many operating hour
          await this.placesRepository.insertManyOperatingHourRepository(
            prisma,
            operatingHourEntity,
          );

          // system log
          return {
            success: true,
            message: 'created operating hour successfully',
            data: null,
          };
        },
      );

    // return
    return result;
  }

  async adminGetPlaceOperatingHourService(
    admin: any,
  ): Promise<OperatingHourDtoResponse[]> {
    const operatingHourEntities: OperatingHourEntity[] =
      await this.placesRepository.getListOperatingHourPlaceByAdminRepository(
        admin,
      );

    const result: OperatingHourDtoResponse[] = [];

    operatingHourEntities.forEach(
      (operatingHourEntity: OperatingHourEntity) => {
        result.push({
          dayOfWeek: operatingHourEntity.dayOfWeek,
          is24Hours: operatingHourEntity.is24Hours,
          placeId: operatingHourEntity.placeId,
          closingTime: operatingHourEntity.closingTime
            ? operatingHourEntity.closingTime

                .toISOString()
                .split('T')[1]
                .split('.')[0]
            : null,
          id: operatingHourEntity.id,
          isClosed: operatingHourEntity.isClosed,
          openingTime: operatingHourEntity.openingTime
            ? operatingHourEntity.openingTime
                .toISOString()
                .split('T')[1]
                .split('.')[0]
            : null,
        });
      },
    );

    return result;
  }

  async adminUpdatePlaceOperatingHourService(
    admin: any,
    request: OperatingHourDtoResponse,
  ): Promise<NotificationResponseDto> {
    // destruct request
    const { id, is24Hours, isClosed, closingTime, openingTime } = request;

    // get operating hour
    const operatingHourEntity: OperatingHourEntity | null =
      await this.placesRepository.getOperatingHourPlaceByIdRepository(id);

    if (!operatingHourEntity) {
      throw new NotFoundException(`jam operasi tidak ditemukan`);
    }

    // check if admin and request place id
    if (admin.placeId !== operatingHourEntity.placeId) {
      throw new ForbiddenException(`Data tidak bisa diubah`);
    }

    // updated operating hour data
    const updateOperatingHour: OperatingHourEntity = this.updateOperatingHour(
      is24Hours,
      isClosed,
      closingTime,
      openingTime,
      operatingHourEntity,
    );

    // transactional
    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          // updating operating hour
          await this.placesRepository.updateOperatingHourRepository(
            prisma,
            updateOperatingHour,
          );

          // system log
          return {
            success: true,
            message: `berhasil mengubah configurasi jam operasi pada hari ${operatingHourEntity.dayOfWeek}`,
            data: null,
          };
        },
      );

    return result;
  }

  async adminCreateParkingZoneService(
    admin: any,
    request: ParkingZoneRequestDto,
  ): Promise<NotificationResponseDto> {
    // destruct request
    const { zoneName, zoneType, totalSlot, floorLevel } = request;

    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException(`anda tidak memiliki place`);
    }

    // parking zone entity
    const newParkingZone = new ParkingZoneEntity({
      placeId: placeEntity.id,
      zoneName: zoneName,
      floorLevel: floorLevel,
      totalSlots: totalSlot,
      zoneType: zoneType,
      isActive: true,
    });

    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          // create parking zone
          const parkingZoneEntity: ParkingZoneEntity =
            await this.placesRepository.insertParkingZoneRepository(
              prisma,
              newParkingZone,
            );

          // generate parking slot increment from total capacity
          const parkingSlotEntities: ParkingSlotEntity[] =
            await this.generateParkingSlot(parkingZoneEntity);

          // insert slot parking
          await this.placesRepository.insertManyParkingSlotRepository(
            prisma,
            parkingSlotEntities,
          );

          // system log

          return {
            success: true,
            message: 'parking zone dan generate parking slot berhasil dibuat',
            data: null,
          };
        },
      );

    return result;
  }

  async adminGetListParkingZoneService(
    admin: any,
  ): Promise<ParkingZoneDtoResponse[]> {
    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException(`anda tidak memiliki place`);
    }

    const parkingZoneEntities: ParkingZoneEntity[] =
      await this.placesRepository.getParkingZonePlaceAdminRepository(
        placeEntity,
      );

    return parkingZoneEntities.map(
      (parkingZoneEntity): ParkingZoneDtoResponse =>
        mapToParkingZoneDtoResponse(parkingZoneEntity),
    );
  }

  async adminGetListParkingSlotService(
    admin: any,
    idZone: number,
  ): Promise<ParkingSlotDtoResponse[]> {
    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException(`anda tidak memiliki place`);
    }

    const parkingSlotEntities: ParkingSlotEntity[] =
      await this.placesRepository.getListParkingSlotRepository(idZone);

    return parkingSlotEntities.map(
      (parkingSlotEntity): ParkingSlotDtoResponse =>
        mapToParkingSlotDtoResponse(parkingSlotEntity),
    );
  }

  async adminCreatePlaceTariffPlanService(
    admin: any,
    request: TariffPlanRequestDto,
  ): Promise<NotificationResponseDto> {
    // destruct request
    const { description, tariffRates, planName } = request;

    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException(`anda tidak memiliki place`);
    }

    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          const effectiveUntil = new Date(request.effectiveUntil);
          const effectiveFrom = new Date(request.effectiveFrom);

          const newTariffPlanEntity: TariffPlanEntity = new TariffPlanEntity({
            placeId: placeEntity.id,
            description: description,
            effectiveFrom: effectiveFrom,
            effectiveUntil: effectiveUntil,
            planName: planName,
          });

          const tariffPlanEntity: TariffPlanEntity =
            await this.placesRepository.insertTariffPlanRepository(
              prisma,
              newTariffPlanEntity,
            );

          const tariffRateEntities: TariffRateEntity[] = [];
          tariffRates.forEach((tariffRate) => {
            const startTime = DateUtil.toISOTimeOnly(tariffRate.startTime);
            const endTime = DateUtil.toISOTimeOnly(tariffRate.endTime);
            tariffRateEntities.push(
              new TariffRateEntity({
                planId: tariffPlanEntity.id,
                vehicleType: tariffRate.vehicleType,
                slotType: tariffRate.slotType,
                startTime: startTime,
                endTime: endTime,
                dayCategory: tariffRate.dayCategory,
                basePrice: tariffRate.basePrice,
                minimumCharge: tariffRate.minimumCharge,
                dayRate: tariffRate.dayRate,
                gracePeriodMinutes: tariffRate.gracePeriodMinute,
                hourlyRate: tariffRate.hourlyRate,
              }),
            );
          });

          await this.placesRepository.insertManyTariffRateRepository(
            prisma,
            tariffRateEntities,
          );

          return {
            message: 'berhasil membuat tarif plan dan tarif rate',
            success: true,
            data: null,
          };
        },
      );

    return result;
  }

  async adminGetListPlaceTariffPlanService(
    admin: any,
  ): Promise<TariffPlanDtoResponse[]> {
    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException(`anda tidak memiliki place`);
    }

    const tariffPlanEntities: TariffPlanEntity[] =
      await this.placesRepository.getTariffPlanPlaceAdminRepository(
        placeEntity,
      );

    return tariffPlanEntities.map((tariffPlane) =>
      mapToTariffPlanDtoResponse(tariffPlane),
    );
  }

  async adminGetDetailParkingSlotService(
    admin: any,
    idZone: number,
    slotId: number,
  ): Promise<DetailParkingSlotDtoResponse> {
    // get place admin
    const placeEntity: PlaceEntity | null =
      await this.placesRepository.getPlaceByAdminRepository(admin);

    if (!placeEntity) {
      throw new NotFoundException(`anda tidak memiliki place`);
    }

    const parkingSlot = await this.prismaService.parkingSlot.findFirst({
      where: {
        id: slotId,
        zoneId: idZone,
      },
      include: {
        bookings: {
          include: {
            vehicle: true,
          },
          orderBy: {
            bookingTime: 'desc', // Urutkan dari yang terbaru
          },
        },
      },
    });

    if (!parkingSlot) {
      throw new NotFoundException(`Parking slot tidak ditemukan`);
    }

    // Pisahkan booking berdasarkan status
    const completedBookings = parkingSlot.bookings.filter(
      (booking) => booking.bookingStatus === 'completed',
    );

    const activeBookings = parkingSlot.bookings.filter(
      (booking) =>
        booking.bookingStatus === 'pending' ||
        booking.bookingStatus === 'confirmed' ||
        booking.bookingStatus === 'active',
    );

    // Ambil booking completed terakhir (jika ada)
    const lastCompletedBooking =
      completedBookings.length > 0 ? completedBookings[0] : null;

    // Ambil booking aktif terbaru (jika ada)
    const currentActiveBooking =
      activeBookings.length > 0 ? activeBookings[0] : null;

    let slotStatus = 'available';
    if (parkingSlot.isReserved) {
      slotStatus = 'reserved';
    }
    if (parkingSlot.isOccupied) {
      slotStatus = 'occupied';
    }

    return {
      parkingSlotId: parkingSlot.id,
      zoneId: parkingSlot.zoneId,
      slotNumber: parkingSlot.slotNumber,
      slotStatus: slotStatus,
      lastCompletedBooking: lastCompletedBooking
        ? this.mapBookingToDto(lastCompletedBooking)
        : null,
      currentActiveBooking: currentActiveBooking
        ? this.mapBookingToDto(currentActiveBooking)
        : null,
      // tambahkan field lain yang diperlukan
    };
  }

  async adminScanBookingQrCodeDetailParkingSlotService(
    admin: any,
    idZone: number,
    slotId: number,
    request: ScanQrCodeDtoRequest,
  ): Promise<NotificationResponseDto> {
    // Input validation
    const { ref, type, ts } = request;
    if (!['entry', 'exit'].includes(type)) {
      throw new BadRequestException(
        'Invalid scan type. Must be "entry" or "exit"',
      );
    }

    // Get place and parking slot
    const placeEntity =
      await this.placesRepository.getPlaceByAdminRepository(admin);
    if (!placeEntity) {
      throw new NotFoundException(
        'Admin does not have access to any parking place',
      );
    }

    const parkingSlotEntity =
      await this.placesRepository.getListParkingSlotByIdZoneAndIdSlotRepository(
        idZone,
        slotId,
      );
    if (!parkingSlotEntity) {
      throw new NotFoundException('Parking slot not found or inactive');
    }

    // Get booking
    const bookingEntity =
      await this.placesRepository.getBookingByBookingReferenceAndIdSlotRepository(
        ref,
        parkingSlotEntity.id,
      );
    if (!bookingEntity) {
      throw new NotFoundException(
        'Booking not found or does not match the parking slot',
      );
    }

    // Process based on scan type
    try {
      if (type === 'entry') {
        return await this.processEntry(
          admin,
          bookingEntity,
          parkingSlotEntity,
          ts,
        );
      } else {
        return await this.processExit(admin, bookingEntity, parkingSlotEntity);
      }
    } catch (error) {
      this.logger.error(`Failed to process ${type} scan`, {
        error,
        bookingId: bookingEntity.id,
        adminId: admin.id,
      });
      throw error;
    }
  }

  private async processEntry(
    admin: any,
    booking: BookingEntity,
    parkingSlot: ParkingSlotEntity,
    ts: number,
  ): Promise<NotificationResponseDto> {
    // Validate QR code timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    const qrTimestamp = ts;
    const QR_CODE_VALIDITY_SECONDS = 300; // 5 minutes

    if (Math.abs(currentTime - qrTimestamp) > QR_CODE_VALIDITY_SECONDS) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'QR code has expired',
        details: {
          currentTime,
          qrCodeTime: qrTimestamp,
          maximumAllowedDifference: QR_CODE_VALIDITY_SECONDS,
        },
      });
    }

    // Validate booking status for entry
    if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Booking is not in valid status for entry',
        validStatus: BookingStatus.CONFIRMED,
        currentStatus: booking.bookingStatus,
      });
    }

    if (booking.actualEntry) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Vehicle has already entered',
        entryTime: booking.actualEntry,
      });
    }

    const previousStatus = booking.bookingStatus;
    const now = new Date();

    // Prepare updates
    booking.actualEntry = now;
    booking.bookingStatus = BookingStatus.ACTIVE;
    booking.updatedAt = now;

    parkingSlot.isReserved = false;
    parkingSlot.isOccupied = true;
    parkingSlot.updatedAt = now;

    // Create logs
    const accessLog = new AccessLogEntity({
      createdAt: new Date(),
      id: 0,
      notes: '',
      bookingId: booking.id,
      logTime: now,
      logType: 'entry',
      verificationMethod: 'QR_SCAN',
      verifiedBy: `${admin.id}|${admin.fullName}`,
      location: `${booking.Place?.name}|${parkingSlot.slotType}|${parkingSlot.slotNumber}`,
    });

    const statusLog = new BookingStatusLogEntity({
      id: 0,
      bookingId: booking.id,
      changedBy: `${admin.id}|${admin.fullName}`,
      newStatus: BookingStatus.ACTIVE,
      previousStatus,
      statusTime: now,
      reason: 'Vehicle entry via QR code scan',
    });

    // Execute transaction
    await this.prismaService.transactional(async (prisma) => {
      await this.placesRepository.updateBookingEntryParkingRepository(
        prisma,
        booking,
      );
      await this.placesRepository.updateParkingSlotEntryParkingRepository(
        prisma,
        parkingSlot,
      );
      await this.placesRepository.insertBookingStatusLogRepository(
        prisma,
        statusLog,
      );
      await this.placesRepository.insertAccessLogRepository(prisma, accessLog);
    });

    return {
      success: true,
      message:
        'Entry successfully recorded. Vehicle has entered the parking slot',
      data: {
        entryTime: now,
        bookingId: booking.id,
        slotNumber: parkingSlot.slotNumber,
      },
    };
  }

  private async processExit(
    admin: any,
    booking: BookingEntity,
    parkingSlot: ParkingSlotEntity,
  ): Promise<NotificationResponseDto> {
    // Validate booking status for exit
    if (booking.bookingStatus !== BookingStatus.ACTIVE) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Booking is not active for exit',
        requiredStatus: BookingStatus.ACTIVE,
        currentStatus: booking.bookingStatus,
      });
    }

    if (!booking.actualEntry) {
      throw new BadRequestException('Vehicle has not entered yet');
    }

    if (booking.actualExit) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Vehicle has already exited',
        exitTime: booking.actualExit,
      });
    }

    const previousStatus = booking.bookingStatus;
    const now = new Date();

    // Calculate final price
    const finalPrice = this.calculateFinalPrice(booking, now);

    // Prepare updates
    booking.actualExit = now;
    booking.bookingStatus = BookingStatus.COMPLETED;
    booking.finalPrice = finalPrice;
    booking.updatedAt = now;

    parkingSlot.isReserved = false;
    parkingSlot.isOccupied = false;
    parkingSlot.updatedAt = now;

    // Create logs
    const accessLog = new AccessLogEntity({
      createdAt: new Date(),
      id: 0,
      notes: '',
      bookingId: booking.id,
      logTime: now,
      logType: 'exit',
      verificationMethod: 'QR_SCAN',
      verifiedBy: `${admin.id}|${admin.fullName}`,
      location: `${booking.Place?.name}|${parkingSlot.slotType}|${parkingSlot.slotNumber}`,
    });

    const statusLog = new BookingStatusLogEntity({
      id: 0,
      bookingId: booking.id,
      changedBy: `${admin.id}|${admin.fullName}`,
      newStatus: BookingStatus.COMPLETED,
      previousStatus,
      statusTime: now,
      reason: 'Vehicle exit via QR code scan',
    });

    // Execute transaction
    await this.prismaService.transactional(async (prisma) => {
      await this.placesRepository.updateBookingExitParkingRepository(
        prisma,
        booking,
      );
      await this.placesRepository.updateParkingSlotExitParkingRepository(
        prisma,
        parkingSlot,
      );
      await this.placesRepository.insertBookingStatusLogRepository(
        prisma,
        statusLog,
      );
      await this.placesRepository.insertAccessLogRepository(prisma, accessLog);
    });

    return {
      success: true,
      message: 'Exit successfully recorded. Parking slot is now available',
      data: {
        exitTime: now,
        bookingId: booking.id,
        finalPrice,
        duration: this.calculateDuration(booking.actualEntry, now),
      },
    };
  }

  private calculateFinalPrice(booking: BookingEntity, exitTime: Date): Decimal {
    // Implement your pricing logic here
    return booking.estimatedPrice; // Default to estimated price
  }

  private calculateDuration(start: Date, end: Date): string {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private mapBookingToDto(booking: any): BookingParkingSlotDtoResponse {
    return {
      id: booking.id,
      vehicleId: booking.vehicleId,
      bookingReference: booking.bookingReference,
      bookingTime: booking.bookingTime.toISOString(),
      scheduledEntry: booking.scheduledEntry?.toISOString(),
      scheduledExit: booking.scheduledExit?.toISOString(),
      actualEntry: booking.actualEntry?.toISOString(),
      actualExit: booking.actualExit?.toISOString(),
      qrCode: booking.qrCode,
      bookingStatus: booking.bookingStatus,
      cancelReason: booking.cancelReason,
      vehicle: {
        id: booking.vehicle.id,
        licensePlate: booking.vehicle.licensePlate,
        vehicleType: booking.vehicle.vehicleType,
        // tambahkan field vehicle lainnya
      },
    };
  }

  private updatePlaceEntity(
    contactNumber: string,
    email: string,
    description: string,
    latitude: number,
    longitude: number,
    isActive: boolean,
    name: string,
    image: string,
    placeType: PlaceType,
    address: string,
    totalCapacity: number,
    placeEntity: PlaceEntity,
  ): PlaceEntity {
    if (placeEntity.contactNumber !== contactNumber) {
      placeEntity.contactNumber = contactNumber;
    }

    if (placeEntity.email !== email) {
      placeEntity.email = email;
    }

    if (placeEntity.description !== description) {
      placeEntity.description = description;
    }

    if (placeEntity.latitude !== latitude) {
      placeEntity.latitude = latitude;
    }

    if (placeEntity.longitude !== longitude) {
      placeEntity.longitude = longitude;
    }

    if (placeEntity.isActive !== isActive) {
      placeEntity.isActive = isActive;
    }

    if (placeEntity.name !== name) {
      placeEntity.name = name;
    }

    if (placeEntity.image !== image) {
      placeEntity.image = image;
    }

    if (placeEntity.placeType !== placeType) {
      placeEntity.placeType = placeType;
    }

    if (placeEntity.address !== address) {
      placeEntity.address = address;
    }

    if (placeEntity.totalCapacity !== totalCapacity) {
      placeEntity.totalCapacity = totalCapacity;
    }

    return placeEntity;
  }

  private updateOperatingHour(
    is24Hours: boolean,
    isClosed: boolean,
    closingTime: string | null,
    openingTime: string | null,
    operatingHourEntity: OperatingHourEntity,
  ): OperatingHourEntity {
    if (operatingHourEntity.is24Hours !== is24Hours) {
      operatingHourEntity.is24Hours = is24Hours;
    }

    if (operatingHourEntity.isClosed !== isClosed) {
      operatingHourEntity.isClosed = isClosed;
    }

    if (openingTime !== null) {
      operatingHourEntity.openingTime = DateUtil.toISOTimeOnly(openingTime);
    }

    if (closingTime !== null) {
      operatingHourEntity.closingTime = DateUtil.toISOTimeOnly(closingTime);
    }

    return operatingHourEntity;
  }

  private async generateParkingSlot(
    parkingZoneEntity: ParkingZoneEntity,
  ): Promise<ParkingSlotEntity[]> {
    const parkingSlotEntity: ParkingSlotEntity[] = [];

    for (let i = 1; i <= parkingZoneEntity.totalSlots; i++) {
      const slotNumber = this.generateSlotNumber(i, parkingZoneEntity.zoneName);
      parkingSlotEntity.push({
        createdAt: new Date(),
        isDisabledFriendly: false,
        updatedAt: null,
        id: 0,
        zoneId: parkingZoneEntity.id,
        slotNumber: slotNumber,
        slotType: parkingZoneEntity.zoneType || 'Car',
        isReserved: false,
        isOccupied: false,
        hasEvCharger: false,
        isActive: true,
      });
    }

    return parkingSlotEntity;
  }

  private generateSlotNumber(i: number, zoneName: string): string {
    const nameSplit = zoneName.trim().split(' ');
    const nameJoin = nameSplit.join('').toUpperCase();
    return `${nameJoin}-${i}`;
  }
}
