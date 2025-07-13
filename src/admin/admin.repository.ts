import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  mapToPlaceAdminEntity,
  PlaceAdminEntity,
} from '../entities/place.admin.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import { Prisma, PrismaClient } from 'generated/prisma';
import { SystemLogEntity } from '../entities/system.log.entity';
import { mapToPlaceEntity, PlaceEntity } from '../entities/places.entity';
import { ListAdminQueryDto } from './dto/list.admin.dto';
import {
  mapToOperatingHourEntity,
  OperatingHourEntity,
} from '../entities/operating.hours.entity';
import {
  mapToTariffPlanEntity,
  TariffPlanEntity,
} from '../entities/tariff.plan.entity';
import { BookingEntity, mapToBookingEntity } from '../entities/booking.entity';
import { ListDashboardActivityQueryDto } from './dto/admin.dashboard.dto';

export interface IAdminRepository {
  getPlaceAdminByEmailRepository(
    email: string,
  ): Promise<PlaceAdminEntity | null>;

  createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLogEntity: SystemLogEntity,
  ): Promise<void>;

  getPlaceAdminByIdRepository(
    admin: any,
    id: number,
  ): Promise<PlaceAdminEntity | null>;

  getPlaceByPlaceIdRepository(placeId: number): Promise<PlaceEntity | null>;

  insertPlaceAdminRepository(
    prisma: PrismaClient,
    newPlaceAdmin: PlaceAdminEntity,
  ): Promise<PlaceAdminEntity>;

  getCountAdminByPlaceIdRepository(
    admin: any,
    query: ListAdminQueryDto,
  ): Promise<number>;

  findAllAdminByPlaceIdRepository(
    admin: any,
    query: ListAdminQueryDto,
  ): Promise<PlaceAdminEntity[]>;

  updatePlaceAdminRepository(
    prisma: PrismaClient,
    updatedAdmin: PlaceAdminEntity,
  ): Promise<void>;

  getPlaceByAdminRepository(admin: any): Promise<PlaceEntity | null>;

  getAvailableParkingRepository(
    admin: any,
    placeEntity: PlaceEntity,
  ): Promise<number>;

  getOccupiedParkingRepository(
    admin: any,
    placeEntity: PlaceEntity,
  ): Promise<number>;

  getReservedParkingRepository(
    admin: any,
    placeEntity: PlaceEntity,
  ): Promise<number>;

  getOperatingHourTodayPlaceRepository(
    placeEntity: PlaceEntity,
    today: string,
  ): Promise<OperatingHourEntity | null>;

  getTariffPlanPlaceRepository(
    placeEntity: PlaceEntity,
  ): Promise<TariffPlanEntity[]>;

  getAdminDashboardActivityBookingRepository(
    admin: any,
    placeEntity: PlaceEntity,
    query: ListDashboardActivityQueryDto,
  ): Promise<BookingEntity[]>;
}

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getAdminDashboardActivityBookingRepository(
    admin: any,
    placeEntity: PlaceEntity,
    query: ListDashboardActivityQueryDto,
  ): Promise<BookingEntity[]> {
    try {
      const statusFilter =
        query.status && query.status.trim() !== ''
          ? { bookingStatus: query.status } // Changed from bookingStatus to status to match your model
          : {};

      // Pagination calculation
      const page = query.page || 1;
      const perPage = query.perPage || 10;
      const skip = (page - 1) * perPage;

      const bookings = await this.prismaService.booking.findMany({
        where: {
          AND: [
            { parkingSlot: { parkingZone: { placeId: placeEntity.id } } },
            statusFilter,
          ],
        },
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
          user: {
            include: {
              profile: true,
            },
          },
        },
        skip: skip,
        take: perPage,
        orderBy: {
          id: 'desc',
        },
      });

      return bookings.map((value) =>
        mapToBookingEntity({
          booking: value,
          place: value.parkingSlot.parkingZone.place,
          vehicle: value.vehicle,
          user: value.user,
          userProfile: value.user.profile ?? undefined,
          slot: value.parkingSlot,
        }),
      );
    } catch (e) {
      this.logger.error(`get admin dashboard activity booking repository ${e}`);

      handlePrismaError(e, 'get admin dashboard activity booking repository');
    }
  }

  async getTariffPlanPlaceRepository(
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
      this.logger.error(`get tariff plan place repository ${e}`);

      handlePrismaError(e, 'get tariff plan place repository');
    }
  }

  async getOperatingHourTodayPlaceRepository(
    placeEntity: PlaceEntity,
    today: string,
  ): Promise<OperatingHourEntity | null> {
    try {
      const operatingHour = await this.prismaService.operatingHour.findFirst({
        where: {
          placeId: placeEntity.id,
          dayOfWeek: today,
        },
      });

      return operatingHour ? mapToOperatingHourEntity(operatingHour) : null;
    } catch (e) {
      this.logger.error(`get operating hour today repository ${e}`);

      handlePrismaError(e, 'get operating hour today repository');
    }
  }

  async getReservedParkingRepository(
    admin: any,
    placeEntity: PlaceEntity,
  ): Promise<number> {
    try {
      const sql = `select COUNT(s.slot_id)
                   from parking_slots s
                            JOIN parking_zones z on z.zone_id = s.zone_id
                   where z.place_id = ${placeEntity.id}
                     and s.is_reserved = true;`;

      const count =
        await this.prismaService.$queryRawUnsafe<{ count: number }[]>(sql);

      return Number(count[0]?.count) ?? 0;
    } catch (e) {
      this.logger.error(`get reserved parking repository ${e}`);

      handlePrismaError(e, 'get reserved parking repository');
    }
  }

  async getOccupiedParkingRepository(
    admin: any,
    placeEntity: PlaceEntity,
  ): Promise<number> {
    try {
      const sql = `select COUNT(s.slot_id)
                   from parking_slots s
                            JOIN parking_zones z on z.zone_id = s.zone_id
                   where z.place_id = ${placeEntity.id}
                     and s.is_occupied = true;`;

      const count =
        await this.prismaService.$queryRawUnsafe<{ count: number }[]>(sql);

      return Number(count[0]?.count) ?? 0;
    } catch (e) {
      this.logger.error(`get occupied parking repository ${e}`);

      handlePrismaError(e, 'get occupied parking repository');
    }
  }

  async getAvailableParkingRepository(
    admin: any,
    placeEntity: PlaceEntity,
  ): Promise<number> {
    try {
      const sql = `select COUNT(s.slot_id)
                   from parking_slots s
                            JOIN parking_zones z on z.zone_id = s.zone_id
                   where z.place_id = ${placeEntity.id}
                     and (s.is_reserved = false and s.is_occupied = false);`;

      const count =
        await this.prismaService.$queryRawUnsafe<{ count: number }[]>(sql);

      return Number(count[0]?.count) ?? 0;
    } catch (e) {
      this.logger.error(`get available parking repository ${e}`);

      handlePrismaError(e, 'get available parking repository');
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

  async updatePlaceAdminRepository(
    prisma: PrismaClient,
    admin: PlaceAdminEntity,
  ): Promise<void> {
    try {
      await prisma.placeAdmin.update({
        where: {
          id: admin.id,
        },
        data: {
          username: admin.username,
          email: admin.email,
          passwordHash: admin.passwordHash,
          fullName: admin.fullName,
          role: admin.role,
          contactNumber: admin.contactNumber,
          isActive: admin.isActive,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update admin repository ${e}`);

      handlePrismaError(e, 'update admin repository');
    }
  }

  async findAllAdminByPlaceIdRepository(
    admin: any,
    query: ListAdminQueryDto,
  ): Promise<PlaceAdminEntity[]> {
    try {
      // search field
      const searchFields = ['username', 'email', 'fullName', 'contactNumber'];

      // search query
      const searchQuery = query.search
        ? {
            OR: searchFields.map((field) => ({
              [field]: { contains: query.search, mode: 'insensitive' },
            })),
          }
        : {};

      // pagination calculation
      const page: number = query.page || 1;
      const perPage: number = query.perPage || 10;
      const skip: number = (page - 1) * perPage;

      // sorting
      const orderBy: Prisma.PlaceAdminOrderByWithRelationInput = {};

      if (query.sortBy && query.sortValue) {
        const sortField = query.sortBy;
        const sortOrder = query.sortValue.toLowerCase() as 'asc' | 'desc';

        // Validate the sort field exists in the model
        const validSortFields = [
          'createdAt',
          'username',
          'email',
          'fullName',
          'contactNumber',
        ];
        if (validSortFields.includes(sortField)) {
          orderBy[sortField] = sortOrder;
        }
      } else {
        // Default sorting
        orderBy.createdAt = 'desc';
      }

      const admins = await this.prismaService.placeAdmin.findMany({
        where: {
          AND: [{ placeId: admin.placeId }, searchQuery].filter(
            (condition) => Object.keys(condition).length > 0,
          ),
        },
        skip: skip,
        take: perPage,
        orderBy: orderBy,
      });

      // init array
      const adminEntities: PlaceAdminEntity[] = [];
      admins.map((value) => adminEntities.push(mapToPlaceAdminEntity(value)));

      return adminEntities;
    } catch (e) {
      this.logger.error(`get find all admin by place id repository ${e}`);

      handlePrismaError(e, 'get find all admin by place id repository');
    }
  }

  async getCountAdminByPlaceIdRepository(
    admin: any,
    query: ListAdminQueryDto,
  ): Promise<number> {
    try {
      // search field
      const searchFields = ['username', 'email', 'fullName', 'contactNumber'];

      // search query
      const searchQuery = query.search
        ? {
            OR: searchFields.map((field) => ({
              [field]: { contains: query.search, mode: 'insensitive' },
            })),
          }
        : {};

      const total = await this.prismaService.placeAdmin.count({
        where: {
          AND: [{ placeId: admin.placeId }, searchQuery].filter(
            (condition) => Object.keys(condition).length > 0,
          ),
        },
      });

      return total;
    } catch (e) {
      this.logger.error(`get count admin place id repository ${e}`);

      handlePrismaError(e, 'get count admin place id repository');
    }
  }

  async insertPlaceAdminRepository(
    prisma: PrismaClient,
    newPlaceAdmin: PlaceAdminEntity,
  ): Promise<PlaceAdminEntity> {
    try {
      const placeAdmin = await prisma.placeAdmin.create({
        data: {
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

  async getPlaceByPlaceIdRepository(
    placeId: number,
  ): Promise<PlaceEntity | null> {
    try {
      const place = await this.prismaService.place.findUnique({
        where: { id: placeId },
      });

      return place ? mapToPlaceEntity({ place: place }) : null;
    } catch (e) {
      this.logger.error(`get place by id repository ${e}`);

      handlePrismaError(e, 'get place by id repository');
    }
  }

  async getPlaceAdminByIdRepository(
    admin: any,
    id: number,
  ): Promise<PlaceAdminEntity | null> {
    try {
      const placeAdmin = await this.prismaService.placeAdmin.findUnique({
        where: { id: id, placeId: admin.placeId },
      });

      return placeAdmin ? mapToPlaceAdminEntity(placeAdmin) : null;
    } catch (e) {
      this.logger.error(`get place admin by id repository ${e}`);

      handlePrismaError(e, 'get place admin by id repository');
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

  async getPlaceAdminByEmailRepository(
    email: string,
  ): Promise<PlaceAdminEntity | null> {
    try {
      const placeAdmin = await this.prismaService.placeAdmin.findFirst({
        where: { email: email },
      });

      return placeAdmin ? mapToPlaceAdminEntity(placeAdmin) : null;
    } catch (e) {
      this.logger.error(`get place admin by email repository ${e}`);

      handlePrismaError(e, 'get place admin by email repository');
    }
  }
}
