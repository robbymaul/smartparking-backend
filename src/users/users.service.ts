import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { IUsersRepository } from './users.repository';
import {
  GetUserResponseDto,
  mapToGetUserResponseDto,
  UpdatePasswordUserDto,
} from './dto/user.dto';
import {
  mapToUserProfileResponseToDto,
  UserProfileResponseDto,
} from './dto/profile.dto';
import {
  CreateVehicleRequestDto,
  mapToVehicleResponseDto,
  VehicleResponseDto,
} from './dto/vehicles.dto';
import { UserEntity } from '../entities/user.entity';
import { VehicleEntity } from '../entities/vehicle.entity';
import { SystemLogEntity } from '../entities/system.log.entity';
import { PrismaClient } from 'generated/prisma';
import {
  mapToNotificationResponseDto,
  NotificationResponseDto,
} from '../auth/dto/notification.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
  ) {}

  async getUserService(user: any): Promise<GetUserResponseDto> {
    const userEntity = await this.usersRepository.getUserByIdRepository(
      user.id,
    );

    this.logger.debug(`user entity: ${JSON.stringify(userEntity)}`);

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (userEntity.accountStatus !== 'active') {
      throw new BadRequestException(
        `Akun tidak aktif. Status: ${userEntity.accountStatus}`,
      );
    }

    return mapToGetUserResponseDto(userEntity);
  }

  async getProfileService(user: any): Promise<UserProfileResponseDto> {
    const userEntity = await this.checkExistingUser(user);

    const userProfileEntity =
      await this.usersRepository.getUserProfileByUserIdRepository(userEntity);

    this.logger.debug(
      `user profile entity: ${JSON.stringify(userProfileEntity)}`,
    );

    if (!userProfileEntity) {
      throw new NotFoundException('User profile tidak ditemukan');
    }

    return mapToUserProfileResponseToDto(userProfileEntity);
  }

  async updateUserProfileService(
    user: any,
    updateUserProfile: UserProfileResponseDto,
  ): Promise<UserProfileResponseDto> {
    const userEntity = await this.checkExistingUser(user);

    const userProfileEntity =
      await this.usersRepository.getUserProfileByUserIdRepository(userEntity);

    this.logger.debug(
      `user profile entity: ${JSON.stringify(userProfileEntity)}`,
    );

    if (!userProfileEntity) {
      throw new NotFoundException('User profile tidak ditemukan');
    }

    Object.assign(userProfileEntity, updateUserProfile);

    await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<void> => {
        await this.usersRepository.updateUserProfileRepository(
          prisma,
          userProfileEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'update user profile',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            userId: userEntity.id,
            userProfile: userProfileEntity.id,
            timestamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.usersRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );
      },
    );

    return mapToUserProfileResponseToDto(userProfileEntity);
  }

  async getVehiclesService(user: any): Promise<VehicleResponseDto[]> {
    const userEntity = await this.checkExistingUser(user);

    const vehiclesEntity =
      await this.usersRepository.getVehiclesByUserIdRepository(userEntity);

    this.logger.debug(`vehicle entity: ${JSON.stringify(vehiclesEntity)}`);

    return vehiclesEntity.map((value) => mapToVehicleResponseDto(value));
  }

  async createVehiclesService(
    user: any,
    createVehicleRequest: CreateVehicleRequestDto,
  ): Promise<VehicleResponseDto> {
    const {
      vehicleType,
      color,
      height,
      length,
      licensePlate,
      rfidTag,
      model,
      width,
      brand,
    } = createVehicleRequest;

    const userEntity = await this.checkExistingUser(user);

    const newVehicleEntity = new VehicleEntity({
      userId: userEntity.id ?? 0,
      licensePlate: licensePlate,
      vehicleType: vehicleType,
      brand: brand,
      model: model,
      color: color,
      rfidTag: rfidTag,
      length: length,
      width: width,
      height: height,
      isActive: true,
      createdAt: new Date(),
    });

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<VehicleEntity> => {
        const vehicleEntity =
          await this.usersRepository.createVehicleRepository(
            prisma,
            newVehicleEntity,
          );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'create vehicle user',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            userId: userEntity.id,
            vehicleId: vehicleEntity.id,
            timestamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.usersRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return vehicleEntity;
      },
    );

    return mapToVehicleResponseDto(result);
  }

  async updateVehicleService(
    user: any,
    id: number,
    updateVehicleRequest: VehicleResponseDto,
  ): Promise<VehicleResponseDto> {
    this.logger.debug(
      `update vehicle request: ${JSON.stringify(updateVehicleRequest)}`,
    );
    const userEntity = await this.checkExistingUser(user);

    const vehicleEntity =
      await this.usersRepository.getVehiclesByUserIdAndIdRepository(
        userEntity,
        id,
      );

    this.logger.debug(`vehicle entity: ${JSON.stringify(vehicleEntity)}`);

    if (!vehicleEntity) {
      throw new NotFoundException('vehicle tidak ditemukan');
    }

    Object.assign(vehicleEntity, updateVehicleRequest);

    this.logger.debug(
      `vehicle entity update: ${JSON.stringify(vehicleEntity)}`,
    );

    await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<void> => {
        await this.usersRepository.updateVehiclesRepository(
          prisma,
          vehicleEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'update vehicle user',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            userId: userEntity.id,
            vehicleId: vehicleEntity.id,
            timestamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.usersRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );
      },
    );

    return mapToVehicleResponseDto(vehicleEntity);
  }

  async deleteVehicleService(
    user: any,
    id: number,
  ): Promise<NotificationResponseDto> {
    const userEntity = await this.checkExistingUser(user);

    const vehicleEntity =
      await this.usersRepository.getVehiclesByUserIdAndIdRepository(
        userEntity,
        id,
      );

    this.logger.debug(`vehicle entity: ${JSON.stringify(vehicleEntity)}`);

    if (!vehicleEntity) {
      throw new NotFoundException('vehicle tidak ditemukan');
    }

    this.logger.debug(
      `vehicle entity delete: ${JSON.stringify(vehicleEntity)}`,
    );

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        await this.usersRepository.deleteVehiclesRepository(
          prisma,
          vehicleEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'delete vehicle user',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            userId: userEntity.id,
            vehicleId: vehicleEntity.id,
            timestamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.usersRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: 'vehicle berhasil di hapus',
        });
      },
    );

    return result;
  }

  async updatePasswordUserService(
    user: any,
    updatePasswordUser: UpdatePasswordUserDto,
  ): Promise<NotificationResponseDto> {
    if (
      updatePasswordUser.newPassword !== updatePasswordUser.confirmNewPassword
    ) {
      throw new BadRequestException('password dan confirm password harus sama');
    }

    const userEntity = await this.checkExistingUser(user);

    const validOldPassword = await bcrypt.compare(
      updatePasswordUser.oldPassword,
      userEntity.passwordHash,
    );

    if (!validOldPassword) {
      throw new BadRequestException('password sebelumnya tidak sesuai');
    }

    userEntity.passwordHash = await bcrypt.hash(
      updatePasswordUser.newPassword,
      10,
    );

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        await this.usersRepository.updateUserPasswordRepository(
          prisma,
          userEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'user update password',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            userId: userEntity.id,
            timestamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.usersRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: 'password berhasil di ubah',
        });
      },
    );

    return result;
  }

  private async checkExistingUser(user: any): Promise<UserEntity> {
    const userEntity = await this.usersRepository.getUserByIdRepository(
      user.id,
    );

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (userEntity.accountStatus !== 'active') {
      throw new BadRequestException(
        `Akun tidak aktif. Status: ${userEntity.accountStatus}`,
      );
    }

    return userEntity;
  }
}
