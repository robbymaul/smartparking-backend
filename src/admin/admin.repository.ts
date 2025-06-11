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
}

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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

      return place ? mapToPlaceEntity(place) : null;
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
