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
} from './dto/parking.zone.dto';
import {
  mapToParkingSlotDtoResponse,
  ParkingSlotDtoResponse,
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
  ): Promise<PlaceResponseDto[]> {
    const placesEntities = await this.placesRepository.getListPlacesRepository(
      page,
      limit,
      search,
      city,
      area,
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
          };
        },
      );

    return result;
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
}
