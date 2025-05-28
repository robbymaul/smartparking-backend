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

export interface IPlacesRepository {
  getListPlacesRepository(
    page: number,
    limit: number,
    search?: string,
    city?: string,
    area?: string,
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
}

@Injectable()
export class PlacesRepository implements IPlacesRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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
          SELECT *
          FROM (SELECT *,
                       (
                           6371000 * acos(
                                   cos(radians(${latitude})) * cos(radians("latitude")) *
                                   cos(radians("longitude") - radians(${longitude}))
                                       + sin(radians(${latitude})) * sin(radians("latitude"))
                                     )
                           ) AS distance
                FROM "places") AS subquery
          WHERE distance <= ${radius}
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

      return rawPlaces.map((place: any) => mapToPlaceEntity(place));
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
        ? mapToPlaceEntity(places, places.operatingHours, places.tariffPlans)
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
  ): Promise<PlaceEntity[]> {
    try {
      const skip = (page - 1) * limit;

      const whereClause: any = {
        isActive: true,
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
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
        mapToPlaceEntity(value, value.operatingHours, value.tariffPlans),
      );
    } catch (e) {
      this.logger.error(`get places repository ${e}`);

      handlePrismaError(e, 'get places repository');
    }
  }
}
