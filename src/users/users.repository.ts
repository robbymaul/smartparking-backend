import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { mapToUserEntity, UserEntity } from '../entities/user.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import {
  mapToUserProfileEntity,
  UserProfileEntity,
} from '../entities/user.profile.entity';
import { mapToVehicleEntity, VehicleEntity } from '../entities/vehicle.entity';
import { SystemLogEntity } from '../entities/system.log.entity';
import { PrismaClient } from 'generated/prisma';

export interface IUsersRepository {
  getUserProfileByUserIdRepository(
    userEntity: UserEntity,
  ): Promise<UserProfileEntity | null>;

  getUserByIdRepository(user: any): Promise<UserEntity | null>;

  getVehiclesByUserIdRepository(
    userEntity: UserEntity,
  ): Promise<VehicleEntity[]>;

  createVehicleRepository(
    prisma: PrismaClient,
    newVehicleEntity: VehicleEntity,
  ): Promise<VehicleEntity>;

  updateUserProfileRepository(
    prisma: PrismaClient,
    userProfileEntity: UserProfileEntity,
  ): Promise<void>;

  getVehiclesByUserIdAndIdRepository(
    userEntity: UserEntity,
    id: number,
  ): Promise<VehicleEntity | null>;

  updateVehiclesRepository(
    prisma: PrismaClient,
    vehicleEntity: VehicleEntity,
  ): Promise<void>;

  createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLog: SystemLogEntity,
  ): Promise<void>;

  deleteVehiclesRepository(
    prisma: PrismaClient,
    vehicleEntity: VehicleEntity,
  ): Promise<void>;

  updateUserPasswordRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async updateUserPasswordRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await this.prismaService.user.update({
        where: {
          id: userEntity.id,
        },
        data: {
          passwordHash: userEntity.passwordHash,
        },
      });
    } catch (e) {
      this.logger.error(`update user password repository ${e}`);

      handlePrismaError(e, 'update user password repository');
    }
  }

  async deleteVehiclesRepository(
    prisma: PrismaClient,
    vehicleEntity: VehicleEntity,
  ): Promise<void> {
    try {
      await prisma.vehicle.delete({
        where: {
          id: vehicleEntity.id,
        },
      });
    } catch (e) {
      this.logger.error(`delete vehicles repository ${e}`);

      handlePrismaError(e, 'delete vehicles repository');
    }
  }

  async createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLog: SystemLogEntity,
  ): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          ...newSystemLog,
        },
      });
    } catch (e) {
      this.logger.error(`create system log repository ${e}`);

      handlePrismaError(e, 'create system log repository');
    }
  }

  async updateVehiclesRepository(
    prisma: PrismaClient,
    vehicleEntity: VehicleEntity,
  ): Promise<void> {
    const {
      id,
      userId, // biasanya foreign key, jangan di-update
      createdAt, // biarkan tetap
      ...updatableFields
    } = vehicleEntity;

    try {
      await prisma.vehicle.update({
        where: {
          id: vehicleEntity.id,
        },
        data: {
          ...updatableFields,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update vehicles repository ${e}`);

      handlePrismaError(e, 'update vehicles repository');
    }
  }

  async getVehiclesByUserIdAndIdRepository(
    userEntity: UserEntity,
    id: number,
  ): Promise<VehicleEntity | null> {
    try {
      const vehicle = await this.prismaService.vehicle.findFirst({
        where: {
          id: id,
          userId: userEntity.id,
        },
      });

      return vehicle ? mapToVehicleEntity(vehicle) : null;
    } catch (e) {
      this.logger.error(`get vehicles by user id and id repository ${e}`);

      handlePrismaError(e, 'get vehicles by user id and id repository');
    }
  }

  async updateUserProfileRepository(
    prisma: PrismaClient,
    userProfileEntity: UserProfileEntity,
  ): Promise<void> {
    try {
      const userProfile = await prisma.userProfile.update({
        where: {
          id: userProfileEntity.id,
        },
        data: {
          ...userProfileEntity,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update user profile repository ${e}`);

      handlePrismaError(e, 'update user profile repository');
    }
  }

  async createVehicleRepository(
    prisma: PrismaClient,
    newVehicleEntity: VehicleEntity,
  ): Promise<VehicleEntity> {
    try {
      const vehicles = await prisma.vehicle.create({
        data: newVehicleEntity,
      });

      return mapToVehicleEntity(vehicles);
    } catch (e) {
      this.logger.error(`create vehicles repository ${e}`);

      handlePrismaError(e, 'create vehicles repository');
    }
  }

  async getVehiclesByUserIdRepository(
    userEntity: UserEntity,
  ): Promise<VehicleEntity[]> {
    try {
      const vehicles = await this.prismaService.vehicle.findMany({
        where: {
          userId: userEntity.id,
        },
      });

      return vehicles.map((value) => mapToVehicleEntity(value));
    } catch (e) {
      this.logger.error(`get vehicles user by id repository ${e}`);

      handlePrismaError(e, 'get vehicles user by id repository');
    }
  }

  async getUserByIdRepository(userId: any): Promise<UserEntity | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          vehicles: true,
        },
      });

      return user
        ? mapToUserEntity({
            user: user,
            vehicle: user.vehicles,
          })
        : null;
    } catch (e) {
      this.logger.error(`get user by id repository ${e}`);

      handlePrismaError(e, 'get user by id repository');
    }
  }

  async getUserProfileByUserIdRepository(
    userEntity: UserEntity,
  ): Promise<UserProfileEntity | null> {
    try {
      const userProfile = await this.prismaService.userProfile.findUnique({
        where: {
          userId: userEntity.id,
        },
      });

      return userProfile
        ? mapToUserProfileEntity({
            profile: userProfile,
          })
        : null;
    } catch (e) {
      this.logger.error(`get user profile by user id repository ${e}`);

      handlePrismaError(e, 'get user profile by user id repository');
    }
  }
}
