import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { mapToPlaceEntity, PlaceEntity } from '../entities/places.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import {
  mapToPlacesRatingEntity,
  PlacesRatingEntity,
} from '../entities/places.rating.entity';
import {
  mapToParkingZoneEntity,
  ParkingZoneEntity,
} from '../entities/parking.zone.entity';
import {
  mapToParkingSlotEntity,
  ParkingSlotEntity,
} from '../entities/parking.slot.entity';
import { PrismaClient } from 'generated/prisma';
import {
  mapToPlaceAdminEntity,
  PlaceAdminEntity,
} from '../entities/place.admin.entity';
import { SystemLogEntity } from '../entities/system.log.entity';
import {
  mapToOperatingHourEntity,
  OperatingHourEntity,
} from '../entities/operating.hours.entity';
import {
  mapToTariffPlanEntity,
  TariffPlanEntity,
} from '../entities/tariff.plan.entity';
import { TariffRateEntity } from '../entities/tariff.rate.entity';
import { BookingEntity, mapToBookingEntity } from '../entities/booking.entity';
import { AccessLogEntity } from 'src/entities/access.log.entity';
import { BookingStatusLogEntity } from '../entities/booking.status.log.entity';

export interface IPlacesRepository {
  getListPlacesRepository(
    page: number,
    limit: number,
    search?: string,
    city?: string,
    area?: string,
    type?: string,
  ): Promise<PlaceEntity[]>;

  getPlaceByIdRepository(id: number): Promise<PlaceEntity | null>;

  getPlaceNearbyRepository(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<PlaceEntity[]>;

  getListPlacesRatingRepository(
    placesId: number,
    page: number,
    limit: number,
  ): Promise<PlacesRatingEntity[]>;

  getListParkingZoneRepository(placesId: number): Promise<ParkingZoneEntity[]>;

  getListParkingSlotRepository(zoneId: number): Promise<ParkingSlotEntity[]>;

  insertPlaceRepository(
    prisma: PrismaClient,
    newPlace: PlaceEntity,
  ): Promise<PlaceEntity>;

  insertPlaceAdminRepository(
    prisma: PrismaClient,
    newPlaceAdmin: PlaceAdminEntity,
  ): Promise<PlaceAdminEntity>;

  createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLogEntity: SystemLogEntity,
  ): Promise<void>;

  getPlaceByAdminRepository(admin: any): Promise<PlaceEntity | null>;

  updatePlaceRepository(
    prisma: PrismaClient,
    updatePlaceEntity: PlaceEntity,
  ): Promise<void>;

  insertManyOperatingHourRepository(
    prisma: PrismaClient,
    operatingHourEntity: OperatingHourEntity[],
  ): Promise<void>;

  getListOperatingHourPlaceByAdminRepository(
    admin: any,
  ): Promise<OperatingHourEntity[]>;

  getOperatingHourPlaceByIdRepository(
    id: number,
  ): Promise<OperatingHourEntity | null>;

  updateOperatingHourRepository(
    prisma: PrismaClient,
    updateOperatingHour: OperatingHourEntity,
  ): Promise<void>;

  insertParkingZoneRepository(
    prisma: PrismaClient,
    newParkingZone: ParkingZoneEntity,
  ): Promise<ParkingZoneEntity>;

  insertManyParkingSlotRepository(
    prisma: PrismaClient,
    parkingSlotEntities: ParkingSlotEntity[],
  ): Promise<void>;

  getParkingZonePlaceAdminRepository(
    placeEntity: PlaceEntity,
  ): Promise<ParkingZoneEntity[]>;

  insertTariffPlanRepository(
    prisma: PrismaClient,
    newTariffPlanEntity: TariffPlanEntity,
  ): Promise<TariffPlanEntity>;

  insertManyTariffRateRepository(
    prisma: PrismaClient,
    tariffRateEntities: TariffRateEntity[],
  ): Promise<void>;

  getTariffPlanPlaceAdminRepository(
    placeEntity: PlaceEntity,
  ): Promise<TariffPlanEntity[]>;

  getListParkingSlotByIdZoneAndIdSlotRepository(
    idZone: number,
    slotId: number,
  ): Promise<ParkingSlotEntity | null>;

  getBookingByBookingReferenceAndIdSlotRepository(
    ref: string,
    id: number,
  ): Promise<BookingEntity | null>;

  updateBookingEntryParkingRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity>;

  updateParkingSlotEntryParkingRepository(
    prisma: PrismaClient,
    updatedSlot: ParkingSlotEntity,
  ): Promise<ParkingSlotEntity>;

  insertAccessLogRepository(
    prisma: PrismaClient,
    accessLog: AccessLogEntity,
  ): Promise<void>;

  insertBookingStatusLogRepository(
    prisma: PrismaClient,
    bookingStatusLog: BookingStatusLogEntity,
  ): Promise<void>;

  updateBookingExitParkingRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity>;

  updateParkingSlotExitParkingRepository(
    prisma: PrismaClient,
    parkingSlotEntity: ParkingSlotEntity,
  ): Promise<ParkingSlotEntity>;
}

@Injectable()
export class PlacesRepository implements IPlacesRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async updateParkingSlotExitParkingRepository(
    prisma: PrismaClient,
    updatedSlot: ParkingSlotEntity,
  ): Promise<ParkingSlotEntity> {
    try {
      const parkingSlot = await prisma.parkingSlot.update({
        where: {
          id: updatedSlot.id,
        },
        data: {
          isReserved: updatedSlot.isReserved,
          isOccupied: updatedSlot.isOccupied,
          updatedAt: updatedSlot.updatedAt,
        },
      });

      return mapToParkingSlotEntity({ slot: parkingSlot });
    } catch (e) {
      this.logger.error(
        `update parking slot exit parking place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'update parking slot exit parking place admin repository',
      );
    }
  }

  async updateBookingExitParkingRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity> {
    try {
      const booking = await prisma.booking.update({
        where: {
          id: bookingEntity.id,
        },
        data: {
          actualExit: bookingEntity.actualExit,
          bookingStatus: bookingEntity.bookingStatus,
          finalPrice: bookingEntity.finalPrice,
          updatedAt: bookingEntity.updatedAt,
        },
      });

      return mapToBookingEntity({ booking: booking });
    } catch (e) {
      this.logger.error(
        `update booking exit parking place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'update booking exit parking place admin repository',
      );
    }
  }

  async insertBookingStatusLogRepository(
    prisma: PrismaClient,
    bookingStatusLog: BookingStatusLogEntity,
  ): Promise<void> {
    try {
      await prisma.bookingStatusLog.create({
        data: {
          bookingId: bookingStatusLog.bookingId,
          previousStatus: bookingStatusLog.previousStatus,
          newStatus: bookingStatusLog.newStatus,
          changedBy: bookingStatusLog.changedBy,
          reason: bookingStatusLog.reason,
          statusTime: bookingStatusLog.statusTime,
        },
      });
    } catch (e) {
      this.logger.error(
        `insert booking status log entry parking place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'insert booking status log entry parking place admin repository',
      );
    }
  }

  async insertAccessLogRepository(
    prisma: PrismaClient,
    accessLog: AccessLogEntity,
  ): Promise<void> {
    try {
      await prisma.accessLog.create({
        data: {
          bookingId: accessLog.bookingId,
          logType: accessLog.logType,
          logTime: accessLog.logTime,
          verificationMethod: accessLog.verificationMethod,
          verifiedBy: accessLog.verifiedBy,
          location: accessLog.location,
          notes: accessLog.notes,
          createdAt: accessLog.createdAt,
        },
      });
    } catch (e) {
      this.logger.error(
        `insert access log entry parking place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'insert access log entry parking place admin repository',
      );
    }
  }

  async updateParkingSlotEntryParkingRepository(
    prisma: PrismaClient,
    updatedSlot: ParkingSlotEntity,
  ): Promise<ParkingSlotEntity> {
    try {
      const parkingSlot = await prisma.parkingSlot.update({
        where: {
          id: updatedSlot.id,
        },
        data: {
          isReserved: updatedSlot.isReserved,
          isOccupied: updatedSlot.isOccupied,
          updatedAt: updatedSlot.updatedAt,
        },
      });

      return mapToParkingSlotEntity({ slot: parkingSlot });
    } catch (e) {
      this.logger.error(
        `update parking slot entry parking place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'update parking slot entry parking place admin repository',
      );
    }
  }

  async updateBookingEntryParkingRepository(
    prisma: PrismaClient,
    bookingEntity: BookingEntity,
  ): Promise<BookingEntity> {
    try {
      const booking = await prisma.booking.update({
        where: {
          id: bookingEntity.id,
        },
        data: {
          actualEntry: bookingEntity.actualEntry,
          bookingStatus: bookingEntity.bookingStatus,
          updatedAt: bookingEntity.updatedAt,
        },
      });

      return mapToBookingEntity({ booking: booking });
    } catch (e) {
      this.logger.error(
        `update booking entry parking place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'update booking entry parking place admin repository',
      );
    }
  }

  async getBookingByBookingReferenceAndIdSlotRepository(
    ref: string,
    slotId: number,
  ): Promise<BookingEntity | null> {
    try {
      const booking = await this.prismaService.booking.findFirst({
        where: {
          bookingReference: ref,
          slotId: slotId,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          vehicle: true,
          parkingSlot: true,
        },
      });

      return booking
        ? mapToBookingEntity({
            booking: booking,
            slot: booking.parkingSlot,
            vehicle: booking.vehicle,
            user: booking.user,
            userProfile: booking.user.profile || undefined,
          })
        : null;
    } catch (e) {
      this.logger.error(
        `get booking by booking reference and id slot place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'get booking by booking reference and id slot place admin repository',
      );
    }
  }

  async getListParkingSlotByIdZoneAndIdSlotRepository(
    idZone: number,
    slotId: number,
  ): Promise<ParkingSlotEntity | null> {
    try {
      const parkingSlot = await this.prismaService.parkingSlot.findFirst({
        where: {
          id: slotId,
          zoneId: idZone,
          isActive: true,
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
          parkingZone: true,
        },
      });

      return parkingSlot
        ? mapToParkingSlotEntity({
            slot: parkingSlot,
            parkingZone: parkingSlot.parkingZone,
          })
        : null;
    } catch (e) {
      this.logger.error(
        `get list parking slot by id zone and id slot place admin repository ${e}`,
      );

      handlePrismaError(
        e,
        'get list parking slot by id zone and id slot place admin repository',
      );
    }
  }

  async getTariffPlanPlaceAdminRepository(
    placeEntity: PlaceEntity,
  ): Promise<TariffPlanEntity[]> {
    try {
      const tariffPlan = await this.prismaService.tariffPlan.findMany({
        where: {
          placeId: placeEntity.id,
        },
        include: {
          tariffRates: true,
        },
      });

      return tariffPlan.map((value) => mapToTariffPlanEntity(value));
    } catch (e) {
      this.logger.error(`get tariff plan place admin repository ${e}`);

      handlePrismaError(e, 'get tariff plan place admin repository');
    }
  }

  async insertManyTariffRateRepository(
    prisma: PrismaClient,
    tariffRateEntities: TariffRateEntity[],
  ): Promise<void> {
    try {
      const createData = tariffRateEntities.map(({ id, ...rest }) => rest);

      await prisma.tariffRate.createMany({
        data: createData,
      });
    } catch (e) {
      this.logger.error(`insert many tariff rate repository ${e}`);

      handlePrismaError(e, 'insert many tariff rate repository');
    }
  }

  async insertTariffPlanRepository(
    prisma: PrismaClient,
    tariffPlanEntity: TariffPlanEntity,
  ): Promise<TariffPlanEntity> {
    try {
      const tariffPlan = await prisma.tariffPlan.create({
        data: {
          placeId: tariffPlanEntity.placeId,
          effectiveUntil: tariffPlanEntity.effectiveUntil,
          effectiveFrom: tariffPlanEntity.effectiveFrom,
          planName: tariffPlanEntity.planName,
          isActive: true,
          description: tariffPlanEntity.description,
        },
      });

      return new TariffPlanEntity({
        id: tariffPlan.id,
        effectiveUntil: tariffPlan.effectiveUntil,
        effectiveFrom: tariffPlan.effectiveFrom,
        planName: tariffPlan.planName,
        isActive: true,
        description: tariffPlan.description,
        placeId: tariffPlan.placeId,
      });
    } catch (e) {
      this.logger.error(`insert tariff plan repository ${e}`);

      handlePrismaError(e, 'insert tariff plan repository');
    }
  }

  async getParkingZonePlaceAdminRepository(
    placeEntity: PlaceEntity,
  ): Promise<ParkingZoneEntity[]> {
    try {
      const parkingZones = await this.prismaService.parkingZone.findMany({
        where: {
          placeId: placeEntity.id,
        },
      });

      return parkingZones.map((parkingZone) =>
        mapToParkingZoneEntity(parkingZone),
      );
    } catch (e) {
      this.logger.error(`get parking zone place admin repository ${e}`);

      handlePrismaError(e, 'get parking zone place admin repository');
    }
  }

  async insertManyParkingSlotRepository(
    prisma: PrismaClient,
    parkingSlotEntities: ParkingSlotEntity[],
  ): Promise<void> {
    try {
      const createData = parkingSlotEntities.map(({ id, ...rest }) => rest);
      this.logger.debug(
        `create data operating hours: ${JSON.stringify(createData)}`,
      );

      await prisma.parkingSlot.createMany({
        data: createData,
      });
    } catch (e) {
      this.logger.error(`insert many parking slot by admin repository ${e}`);

      handlePrismaError(e, 'insert many parking slot by admin repository');
    }
  }

  async insertParkingZoneRepository(
    prisma: PrismaClient,
    parkingZoneEntity: ParkingZoneEntity,
  ): Promise<ParkingZoneEntity> {
    try {
      const parkingZone = await prisma.parkingZone.create({
        data: {
          placeId: parkingZoneEntity.placeId,
          zoneName: parkingZoneEntity.zoneName,
          floorLevel: parkingZoneEntity.floorLevel,
          zoneType: parkingZoneEntity.zoneType,
          totalSlots: parkingZoneEntity.totalSlots,
          isActive: true,
        },
      });

      return mapToParkingZoneEntity(parkingZone);
    } catch (e) {
      this.logger.error(`insert parking zone repository ${e}`);

      handlePrismaError(e, 'insert parking zone repository');
    }
  }

  async updateOperatingHourRepository(
    prisma: PrismaClient,
    updateOperatingHour: OperatingHourEntity,
  ): Promise<void> {
    try {
      await prisma.operatingHour.update({
        where: {
          id: updateOperatingHour.id,
        },
        data: {
          openingTime: updateOperatingHour.openingTime,
          closingTime: updateOperatingHour.closingTime,
          is24hours: updateOperatingHour.is24Hours,
          isClosed: updateOperatingHour.isClosed,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update operating hour repository ${e}`);

      handlePrismaError(e, 'update operating hour repository');
    }
  }

  async getOperatingHourPlaceByIdRepository(
    id: number,
  ): Promise<OperatingHourEntity | null> {
    try {
      const operatingHour = await this.prismaService.operatingHour.findUnique({
        where: {
          id: id,
        },
      });

      return operatingHour ? mapToOperatingHourEntity(operatingHour) : null;
    } catch (e) {
      this.logger.error(`get operating hour place by id repository ${e}`);

      handlePrismaError(e, 'get operating hour place by id repository');
    }
  }

  async getListOperatingHourPlaceByAdminRepository(
    admin: any,
  ): Promise<OperatingHourEntity[]> {
    try {
      const operatingHours = await this.prismaService.operatingHour.findMany({
        where: {
          placeId: admin.placeId,
        },
      });

      return operatingHours.map((operatingHour) =>
        mapToOperatingHourEntity(operatingHour),
      );
    } catch (e) {
      this.logger.error(
        `get list operating hour place by admin repository ${e}`,
      );

      handlePrismaError(e, 'get list operating hour place by admin repository');
    }
  }

  async insertManyOperatingHourRepository(
    prisma: PrismaClient,
    operatingHours: OperatingHourEntity[],
  ): Promise<void> {
    try {
      const createData = operatingHours.map(({ id, ...rest }) => rest);
      this.logger.debug(
        `create data operating hours: ${JSON.stringify(createData)}`,
      );

      await prisma.operatingHour.createMany({
        data: createData,
      });
    } catch (e) {
      this.logger.error(`insert many operating hour by admin repository ${e}`);

      handlePrismaError(e, 'insert many operating hour by admin repository');
    }
  }

  async updatePlaceRepository(
    prisma: PrismaClient,
    placeEntity: PlaceEntity,
  ): Promise<void> {
    try {
      await prisma.place.update({
        where: {
          id: placeEntity.id,
        },
        data: {
          name: placeEntity.name,
          placeType: placeEntity.placeType,
          address: placeEntity.address,
          latitude: placeEntity.latitude,
          longitude: placeEntity.longitude,
          contactNumber: placeEntity.contactNumber,
          email: placeEntity.email,
          description: placeEntity.description,
          totalCapacity: placeEntity.totalCapacity,
          isActive: placeEntity.isActive,
          image: placeEntity.image,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update place by admin repository ${e}`);

      handlePrismaError(e, 'update place by admin repository');
    }
  }

  async getPlaceByAdminRepository(admin: any): Promise<PlaceEntity | null> {
    try {
      const places = await this.prismaService.place.findUnique({
        where: {
          id: admin.placeId,
        },
      });

      return places ? mapToPlaceEntity({ place: places }) : null;
    } catch (e) {
      this.logger.error(`get place by admin repository ${e}`);

      handlePrismaError(e, 'get place by admin repository');
    }
  }

  async createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLogEntity: SystemLogEntity,
  ): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          entityType: newSystemLogEntity.entityType,
          entityId: newSystemLogEntity.entityId,
          action: newSystemLogEntity.action,
          performedBy: newSystemLogEntity.performedBy,
          logLevel: newSystemLogEntity.logLevel,
          logDetails: newSystemLogEntity.logDetails,
        },
      });
    } catch (e) {
      this.logger.error(`create system log repository ${e}`);

      handlePrismaError(e, 'create system log repository');
    }
  }

  async insertPlaceAdminRepository(
    prisma: PrismaClient,
    newPlaceAdmin: PlaceAdminEntity,
  ): Promise<PlaceAdminEntity> {
    try {
      const placeAdmin = await prisma.placeAdmin.create({
        data: {
          // ...newPlaceAdmin,
          placeId: newPlaceAdmin.placeId,
          username: newPlaceAdmin.username,
          email: newPlaceAdmin.email,
          passwordHash: newPlaceAdmin.passwordHash,
          fullName: newPlaceAdmin.fullName,
          role: newPlaceAdmin.role,
          contactNumber: newPlaceAdmin.contactNumber,
          isActive: newPlaceAdmin.isActive,
        },
      });

      return mapToPlaceAdminEntity(placeAdmin);
    } catch (e) {
      this.logger.error(`insert place admin repository ${e}`);

      handlePrismaError(e, 'insert place admin repository');
    }
  }

  async insertPlaceRepository(
    prisma: PrismaClient,
    newPlace: PlaceEntity,
  ): Promise<PlaceEntity> {
    try {
      const place = await prisma.place.create({
        data: {
          name: newPlace.name,
          placeType: newPlace.placeType,
          address: newPlace.address,
          latitude: newPlace.latitude,
          longitude: newPlace.longitude,
          contactNumber: newPlace.contactNumber,
          email: newPlace.email,
          description: newPlace.description,
          totalCapacity: newPlace.totalCapacity,
        },
      });

      return mapToPlaceEntity({ place: place });
    } catch (e) {
      this.logger.error(`register place repository ${e}`);

      handlePrismaError(e, 'register place repository');
    }
  }

  async getListParkingSlotRepository(
    zoneId: number,
  ): Promise<ParkingSlotEntity[]> {
    try {
      const whereClause: any = {
        zoneId: zoneId,
      };

      const parkingSlots = await this.prismaService.parkingSlot.findMany({
        where: whereClause,
        include: {
          parkingZone: true,
        },
        orderBy: {
          id: 'asc',
        },
      });

      return parkingSlots.map((value) =>
        mapToParkingSlotEntity({
          slot: value,
          parkingZone: value.parkingZone,
        }),
      );
    } catch (e) {
      this.logger.error(`get list parking slots repository ${e}`);

      handlePrismaError(e, 'get list parking slots repository');
    }
  }

  async getListParkingZoneRepository(
    placesId: number,
  ): Promise<ParkingZoneEntity[]> {
    try {
      const whereClause: any = {
        placeId: placesId,
      };

      const parkingZones = await this.prismaService.parkingZone.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return parkingZones.map((value) => mapToParkingZoneEntity(value));
    } catch (e) {
      this.logger.error(`get list parking zones repository ${e}`);

      handlePrismaError(e, 'get list parking zones repository');
    }
  }

  async getListPlacesRatingRepository(
    placesId: number,
    page: number,
    limit: number,
  ): Promise<PlacesRatingEntity[]> {
    try {
      const skip = (page - 1) * limit;

      const whereClause: any = {
        isVerified: true,
        placeId: placesId,
      };

      const placesRating = await this.prismaService.placeRating.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return placesRating.map((value) => mapToPlacesRatingEntity(value));
    } catch (e) {
      this.logger.error(`get list places ratings repository ${e}`);

      handlePrismaError(e, 'get list places ratings repository');
    }
  }

  async getPlaceNearbyRepository(
    latitude: number,
    longitude: number,
    radius: number,
  ): Promise<PlaceEntity[]> {
    try {
      const limit = 10;

      const rawPlaces = await this.prismaService.$queryRawUnsafe<any[]>(`
          SELECT place_id AS id, name, place_type AS "placeType", address,
                 latitude, longitude, contact_number AS "contactNumber",
                 email, description, total_capacity AS "totalCapacity",
                 is_active AS "isActive", created_at AS "createdAt",
                 updated_at AS "updatedAt",
                 (
                     6371000 * acos(
                             cos(radians(${latitude})) * cos(radians(latitude)) *
                             cos(radians(longitude) - radians(${longitude})) +
                             sin(radians(${latitude})) * sin(radians(latitude))
                               )
                     ) AS distance
          FROM "places"
          WHERE (
                    6371000 * acos(
                            cos(radians(${latitude})) * cos(radians(latitude)) *
                            cos(radians(longitude) - radians(${longitude})) +
                            sin(radians(${latitude})) * sin(radians(latitude))
                              )
                    ) <= ${radius}
          ORDER BY distance
              LIMIT ${limit}
      `);

      // Optional: ambil relasi secara terpisah kalau dibutuhkan
      // const places = await Promise.all(
      //   rawPlaces.map(async (place): Promise<PlaceEntity> => {
      //     const fullPlace = await this.prismaService.place.findUnique({
      //       where: { id: place.id },
      //     });
      //     return mapToPlaceEntity(fullPlace);
      //   }),
      // );

      this.logger.debug(`places see distance ${JSON.stringify(rawPlaces)}`);

      return rawPlaces.map((place: any) =>
        mapToPlaceEntity({ place: place, distance: place.distance }),
      );
    } catch (e) {
      this.logger.error(`get places nearby repository ${e}`);

      handlePrismaError(e, 'get places nearby repository');
    }
  }

  async getPlaceByIdRepository(id: number): Promise<PlaceEntity | null> {
    try {
      const places = await this.prismaService.place.findUnique({
        where: {
          id: id,
        },
        include: {
          operatingHours: true,
          tariffPlans: {
            include: {
              tariffRates: true,
            },
            where: {
              isActive: true,
              OR: [
                { effectiveUntil: null },
                { effectiveUntil: { gt: new Date() } },
              ],
            },
          },
        },
      });

      return places
        ? mapToPlaceEntity({
            place: places,
            operatingHours: places.operatingHours,
            tariffPlans: places.tariffPlans,
          })
        : null;
    } catch (e) {
      this.logger.error(`get detail places repository ${e}`);

      handlePrismaError(e, 'get detail places repository');
    }
  }

  async getListPlacesRepository(
    page: number,
    limit: number,
    search?: string,
    city?: string,
    area?: string,
    type?: string,
  ): Promise<PlaceEntity[]> {
    try {
      const skip = (page - 1) * limit;

      const whereClause: any = {
        isActive: true,
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          // { address: { contains: search, mode: 'insensitive' } },
          // { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (city) {
        whereClause.address = {
          contains: city,
          mode: 'insensitive',
        };
      }

      if (area) {
        whereClause.address = {
          ...(whereClause.address || {}),
          contains: area,
          mode: 'insensitive',
        };
      }

      if (type && type !== '') {
        whereClause.placeType = {
          ...(whereClause.placeType || {}),
          contains: type,
          mode: 'insensitive',
        };
      }

      const places = await this.prismaService.place.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          operatingHours: true,
          tariffPlans: {
            include: {
              tariffRates: true,
            },
            where: {
              isActive: true,
              OR: [
                { effectiveUntil: null },
                { effectiveUntil: { gt: new Date() } },
              ],
            },
          },
        },
        orderBy: {
          // placeRatings: {
          //   _avg: {
          //     rating: 'desc',
          //   },
          // },
          createdAt: 'desc',
        },
      });

      return places.map((value) =>
        mapToPlaceEntity({
          place: value,
          operatingHours: value.operatingHours,
          tariffPlans: value.tariffPlans,
        }),
      );
    } catch (e) {
      this.logger.error(`get places repository ${e}`);

      handlePrismaError(e, 'get places repository');
    }
  }
}
