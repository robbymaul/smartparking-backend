import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { mapToPlaceEntity, PlaceEntity } from '../entities/places.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';

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
}

@Injectable()
export class PlacesRepository implements IPlacesRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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
      });

      return places ? mapToPlaceEntity(places) : null;
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
          placeRatings: true,
          operatingHours: true,
          tariffPlans: true,
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

      return places.map((value) => mapToPlaceEntity(value));
    } catch (e) {
      this.logger.error(`get places repository ${e}`);

      handlePrismaError(e, 'get places repository');
    }
  }
}
