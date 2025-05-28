import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { IPlacesRepository } from './places.repository';
import { mapToPlaceResponseDto, PlaceResponseDto } from './dto/places.dto';
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

@Injectable()
export class PlacesService {
  constructor(
    @Inject('IPlacesRepository')
    private readonly placesRepository: IPlacesRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
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
}
